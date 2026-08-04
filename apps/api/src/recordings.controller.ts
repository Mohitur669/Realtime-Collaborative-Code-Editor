import { Controller, Post, Get, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import {
  StartRecordingRequest,
  StopRecordingRequest,
  SessionRecording,
  RecordingEvent,
  RecordingListResponse,
} from '@codesync/shared-types';

interface ActiveSession {
  id: string;
  roomId: string;
  title: string;
  startTime: number;
  events: RecordingEvent[];
}

@Controller('api/recordings')
export class RecordingsController {
  private activeSessions = new Map<string, ActiveSession>();
  private completedRecordings = new Map<string, SessionRecording[]>();

  @Post('start')
  startRecording(@Body() body: StartRecordingRequest) {
    const id = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const session: ActiveSession = {
      id,
      roomId: body.roomId,
      title: body.title || `Session ${new Date().toLocaleTimeString()}`,
      startTime: Date.now(),
      events: [
        {
          timestamp: 0,
          type: 'presence',
          author: 'System',
          detail: 'Recording session started',
        },
      ],
    };

    this.activeSessions.set(id, session);
    return { recordingId: id, startedAt: session.startTime };
  }

  @Post('event')
  addEvent(@Body() body: { recordingId: string; type: 'code' | 'chat' | 'presence'; author: string; detail: string }) {
    const session = this.activeSessions.get(body.recordingId);
    if (!session) {
      return { success: false, reason: 'Session not active' };
    }
    const elapsed = Math.max(0, Math.floor((Date.now() - session.startTime) / 1000));
    session.events.push({
      timestamp: elapsed,
      type: body.type,
      author: body.author,
      detail: body.detail,
    });
    return { success: true, count: session.events.length };
  }

  @Post('stop')
  stopRecording(@Body() body: StopRecordingRequest): SessionRecording {
    const session = this.activeSessions.get(body.recordingId);
    if (!session) {
      throw new NotFoundException('Active recording session not found');
    }

    const durationSeconds = Math.max(1, Math.floor((Date.now() - session.startTime) / 1000));
    session.events.push({
      timestamp: durationSeconds,
      type: 'presence',
      author: 'System',
      detail: 'Recording session stopped',
    });

    const recording: SessionRecording = {
      id: session.id,
      roomId: session.roomId,
      title: session.title,
      createdAt: session.startTime,
      durationSeconds,
      eventCount: session.events.length,
      events: session.events,
    };

    const existing = this.completedRecordings.get(session.roomId) || [];
    this.completedRecordings.set(session.roomId, [recording, ...existing]);
    this.activeSessions.delete(body.recordingId);

    return recording;
  }

  @Get('room/:roomId')
  getRecordingsForRoom(@Param('roomId') roomId: string): RecordingListResponse {
    const recordings = this.completedRecordings.get(roomId) || [];
    return { recordings };
  }

  @Get(':recordingId')
  getRecordingDetail(@Param('recordingId') recordingId: string): SessionRecording {
    for (const list of this.completedRecordings.values()) {
      const found = list.find((r) => r.id === recordingId);
      if (found) return found;
    }
    throw new NotFoundException('Recording not found');
  }

  @Delete(':recordingId')
  deleteRecording(@Param('recordingId') recordingId: string) {
    let deleted = false;
    for (const [roomId, list] of this.completedRecordings.entries()) {
      const filtered = list.filter((r) => r.id !== recordingId);
      if (filtered.length !== list.length) {
        this.completedRecordings.set(roomId, filtered);
        deleted = true;
        break;
      }
    }
    return { success: deleted };
  }
}
