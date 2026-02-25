import { Controller, Get, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get('employees')
    @ApiOperation({ summary: 'Get list of employees for chat' })
    getEmployees(@Request() req: any) {
        return this.chatService.getEmployees(req.user.id);
    }

    @Get('my-courses')
    @ApiOperation({ summary: 'Get current student courses for chat' })
    getStudentCourses(@Request() req: any) {
        return this.chatService.getStudentCourses(req.user.id);
    }

    @Get('teacher-courses')
    @ApiOperation({ summary: 'Get current teacher courses for chat' })
    getTeacherCourses(@Request() req: any) {
        return this.chatService.getTeacherCourses(req.user.id);
    }

    @Get('course/:courseId/students')
    @ApiOperation({ summary: 'Get students in a specific course (for teacher)' })
    @ApiParam({ name: 'courseId', type: Number })
    getCourseStudents(
        @Param('courseId', ParseIntPipe) courseId: number,
        @Request() req: any,
    ) {
        return this.chatService.getCourseStudents(courseId, req.user.id);
    }

    @Get('course/:courseId/messages')
    @ApiOperation({ summary: 'Get public messages for a course' })
    @ApiParam({ name: 'courseId', type: Number })
    getCourseMessages(
        @Param('courseId', ParseIntPipe) courseId: number,
        @Request() req: any,
    ) {
        return this.chatService.getCourseMessages(courseId, req.user.id);
    }

    @Get('course/:courseId/teacher-conversation')
    @ApiOperation({ summary: 'Get student-teacher private conversation in a course' })
    @ApiParam({ name: 'courseId', type: Number })
    getConversationWithTeacher(
        @Param('courseId', ParseIntPipe) courseId: number,
        @Request() req: any,
    ) {
        return this.chatService.getConversationWithTeacher(req.user.id, courseId);
    }

    @Get('employee/:employeeId/conversation')
    @ApiOperation({ summary: 'Get conversation with an employee' })
    @ApiParam({ name: 'employeeId', type: Number })
    getConversationWithEmployee(
        @Param('employeeId', ParseIntPipe) employeeId: number,
        @Request() req: any,
    ) {
        return this.chatService.getConversationWithEmployee(req.user.id, employeeId);
    }

    @Get('teacher-inbox')
    @ApiOperation({ summary: 'Get teacher chat inbox' })
    getTeacherInbox(@Request() req: any) {
        return this.chatService.getTeacherInbox(req.user.id);
    }

    @Get('employee-inbox')
    @ApiOperation({ summary: 'Get employee chat inbox' })
    getEmployeeInbox(@Request() req: any) {
        return this.chatService.getEmployeeInbox(req.user.id);
    }

    @Get('course/:courseId/student/:studentId/conversation')
    @ApiOperation({ summary: 'Get private conversation between teacher and student in a course' })
    @ApiParam({ name: 'courseId', type: Number })
    @ApiParam({ name: 'studentId', type: Number })
    getTeacherStudentConversation(
        @Param('courseId', ParseIntPipe) courseId: number,
        @Param('studentId', ParseIntPipe) studentId: number,
        @Request() req: any,
    ) {
        return this.chatService.getTeacherStudentConversation(req.user.id, studentId, courseId);
    }

    @Get('unread/total')
    @ApiOperation({ summary: 'Get total unread messages count' })
    getTotalUnread(@Request() req: any) {
        return this.chatService.getTotalUnreadCount(req.user.id);
    }

    @Get('unread/conversations')
    @ApiOperation({ summary: 'Get count of conversations with unread messages' })
    getUnreadConversations(@Request() req: any) {
        return this.chatService.getUnreadConversationsCount(req.user.id);
    }
}
