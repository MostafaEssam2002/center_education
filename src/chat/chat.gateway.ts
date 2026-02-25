import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private connectedUsers = new Map<string, { id: number; role: string; email: string }>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) { }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) throw new Error('No token provided');

      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      const user = { id: payload.sub, role: payload.role, email: payload.email };

      this.connectedUsers.set(client.id, user);
      client.join(`user_${user.id}`);

      console.log(`[Socket] User ${user.id} connected. SocketID: ${client.id}`);
      client.emit('connected', { status: 'success', userId: user.id });

      // ابعت الإجمالي والجهات فور الاتصال
      const total = await this.chatService.getTotalUnreadCount(user.id);
      const conversations = await this.chatService.getUnreadConversationsCount(user.id);
      client.emit('totalUnreadUpdate', { total, conversations });
    } catch (err) {
      console.log(`[Socket] Connection Auth Error: ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
  }

  private sendError(client: Socket, message: string) {
    client.emit('error', { message });
    client.emit('history_error');
  }

  @SubscribeMessage('joinCourse')
  async handleJoinCourse(@ConnectedSocket() client: Socket, @MessageBody() data: { courseId: number }) {
    try {
      const user = this.connectedUsers.get(client.id);
      if (!user) return;
      client.join(`course_${data.courseId}`);
      const messages = await this.chatService.getCourseMessages(Number(data.courseId), user.id);
      client.emit('courseHistory', { courseId: data.courseId, messages });
    } catch (err) { this.sendError(client, err.message); }
  }

  @SubscribeMessage('broadcastToCourse')
  async handleBroadcastToCourse(@ConnectedSocket() client: Socket, @MessageBody() data: { courseId: number; content: string; imageUrl?: string }) {
    try {
      const user = this.connectedUsers.get(client.id);
      if (!user) return;
      const message = await this.chatService.broadcastToCourse(user.id, Number(data.courseId), data.content, data.imageUrl);
      this.server.to(`course_${data.courseId}`).emit('newCourseMessage', message);
    } catch (err) { this.sendError(client, err.message); }
  }

  @SubscribeMessage('sendToTeacher')
  async handleSendToTeacher(@ConnectedSocket() client: Socket, @MessageBody() data: { courseId: number; content: string; imageUrl?: string }) {
    try {
      const user = this.connectedUsers.get(client.id);
      if (!user) return;
      const message = await this.chatService.sendToTeacher(user.id, Number(data.courseId), data.content, data.imageUrl);
      this.server.to(`user_${user.id}`).emit('newPrivateMessage', message);
      this.server.to(`user_${message.receiverId}`).emit('newPrivateMessage', message);

      // تحديث الإجمالي للمستقبل
      if (message.receiverId) {
        const total = await this.chatService.getTotalUnreadCount(message.receiverId);
        const conversations = await this.chatService.getUnreadConversationsCount(message.receiverId);
        this.server.to(`user_${message.receiverId}`).emit('totalUnreadUpdate', { total, conversations });
      }
    } catch (err) { this.sendError(client, err.message); }
  }

  @SubscribeMessage('replyToStudent')
  async handleReplyToStudent(@ConnectedSocket() client: Socket, @MessageBody() data: { studentId: number; courseId: number; content: string; imageUrl?: string }) {
    try {
      const user = this.connectedUsers.get(client.id);
      if (!user) return;
      const message = await this.chatService.teacherReplyToStudent(user.id, Number(data.studentId), Number(data.courseId), data.content, data.imageUrl);
      this.server.to(`user_${user.id}`).emit('newPrivateMessage', message);
      this.server.to(`user_${data.studentId}`).emit('newPrivateMessage', message);

      const total = await this.chatService.getTotalUnreadCount(Number(data.studentId));
      const conversations = await this.chatService.getUnreadConversationsCount(Number(data.studentId));
      this.server.to(`user_${data.studentId}`).emit('totalUnreadUpdate', { total, conversations });
    } catch (err) { this.sendError(client, err.message); }
  }

  @SubscribeMessage('sendToEmployee')
  async handleSendToEmployee(@ConnectedSocket() client: Socket, @MessageBody() data: { employeeId: number; content: string; imageUrl?: string }) {
    try {
      const user = this.connectedUsers.get(client.id);
      if (!user) return;
      const message = await this.chatService.sendToEmployee(user.id, Number(data.employeeId), data.content, data.imageUrl);
      this.server.to(`user_${user.id}`).emit('newPrivateMessage', message);
      this.server.to(`user_${data.employeeId}`).emit('newPrivateMessage', message);

      const total = await this.chatService.getTotalUnreadCount(Number(data.employeeId));
      const conversations = await this.chatService.getUnreadConversationsCount(Number(data.employeeId));
      this.server.to(`user_${data.employeeId}`).emit('totalUnreadUpdate', { total, conversations });
    } catch (err) { this.sendError(client, err.message); }
  }

  @SubscribeMessage('employeeReply')
  async handleEmployeeReply(@ConnectedSocket() client: Socket, @MessageBody() data: { studentId: number; content: string; imageUrl?: string }) {
    try {
      const user = this.connectedUsers.get(client.id);
      if (!user) return;
      const message = await this.chatService.employeeReplyToStudent(user.id, Number(data.studentId), data.content, data.imageUrl);
      this.server.to(`user_${user.id}`).emit('newPrivateMessage', message);
      this.server.to(`user_${data.studentId}`).emit('newPrivateMessage', message);

      const total = await this.chatService.getTotalUnreadCount(Number(data.studentId));
      const conversations = await this.chatService.getUnreadConversationsCount(Number(data.studentId));
      this.server.to(`user_${data.studentId}`).emit('totalUnreadUpdate', { total, conversations });
    } catch (err) { this.sendError(client, err.message); }
  }

  @SubscribeMessage('getConversationWithTeacher')
  async handleGetConversationWithTeacher(@ConnectedSocket() client: Socket, @MessageBody() data: { courseId: number }) {
    try {
      const user = this.connectedUsers.get(client.id);
      if (!user) return;
      await this.chatService.markAsRead(user.id, undefined, Number(data.courseId));
      const messages = await this.chatService.getConversationWithTeacher(user.id, Number(data.courseId));
      client.emit('conversationHistory', { type: 'teacher', courseId: data.courseId, messages });

      const total = await this.chatService.getTotalUnreadCount(user.id);
      const conversations = await this.chatService.getUnreadConversationsCount(user.id);
      client.emit('totalUnreadUpdate', { total, conversations });
    } catch (err) { this.sendError(client, err.message); }
  }

  @SubscribeMessage('getConversationWithEmployee')
  async handleGetConversationWithEmployee(@ConnectedSocket() client: Socket, @MessageBody() data: { employeeId?: number; studentId?: number }) {
    try {
      const user = this.connectedUsers.get(client.id);
      if (!user) return;
      const otherId = Number(data.employeeId || data.studentId);
      await this.chatService.markAsRead(user.id, otherId);
      const messages = await this.chatService.getConversationWithEmployee(user.id, otherId);
      client.emit('conversationHistory', { type: 'employee', employeeId: otherId, studentId: otherId, messages });

      const total = await this.chatService.getTotalUnreadCount(user.id);
      const conversations = await this.chatService.getUnreadConversationsCount(user.id);
      client.emit('totalUnreadUpdate', { total, conversations });
    } catch (err) { this.sendError(client, err.message); }
  }

  @SubscribeMessage('getTeacherStudentConversation')
  async handleGetTeacherStudentConversation(@ConnectedSocket() client: Socket, @MessageBody() data: { studentId: number; courseId: number }) {
    try {
      const user = this.connectedUsers.get(client.id);
      if (!user) return;
      await this.chatService.markAsRead(user.id, Number(data.studentId), Number(data.courseId));
      const messages = await this.chatService.getTeacherStudentConversation(user.id, Number(data.studentId), Number(data.courseId));
      client.emit('conversationHistory', { type: 'teacher-student', studentId: data.studentId, courseId: data.courseId, messages });

      const total = await this.chatService.getTotalUnreadCount(user.id);
      const conversations = await this.chatService.getUnreadConversationsCount(user.id);
      client.emit('totalUnreadUpdate', { total, conversations });
    } catch (err) { this.sendError(client, err.message); }
  }
}
