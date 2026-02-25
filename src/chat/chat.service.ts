import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessageType } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) { }

  // ===== مدرس يبعت رسالة لكل طلاب الكورس =====
  async broadcastToCourse(senderId: number, courseId: number, content: string, imageUrl?: string) {
    console.log(`[ChatService] Broadcast from ${senderId} to course ${courseId}`);
    const message = await this.prisma.message.create({
      data: {
        content,
        imageUrl,
        type: MessageType.COURSE_BROADCAST,
        senderId,
        courseId,
        receiverId: null,
      },
      include: {
        sender: { select: { id: true, first_name: true, last_name: true, role: true } },
      },
    });
    return message;
  }

  // ===== طالب يبعت رسالة للمدرس =====
  async sendToTeacher(senderId: number, courseId: number, content: string, imageUrl?: string) {
    console.log(`[ChatService] Student ${senderId} to teacher of course ${courseId}`);
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { unique_enrollment_student_course: { studentId: senderId, courseId } },
      include: { course: true },
    });
    if (!enrollment) throw new Error('أنت غير مشترك في هذا الكورس');

    const message = await this.prisma.message.create({
      data: {
        content,
        imageUrl,
        type: MessageType.TO_TEACHER,
        senderId,
        receiverId: enrollment.course.teacherId,
        courseId,
      },
      include: {
        sender: { select: { id: true, first_name: true, last_name: true, role: true } },
        receiver: { select: { id: true, first_name: true, last_name: true, role: true } },
      },
    });
    return message;
  }

  // ===== طالب يبعت رسالة للموظف =====
  async sendToEmployee(senderId: number, receiverId: number, content: string, imageUrl?: string) {
    console.log(`[ChatService] Sending message from ${senderId} to staff/employee ${receiverId}`);
    const message = await this.prisma.message.create({
      data: {
        content,
        imageUrl,
        type: MessageType.TO_EMPLOYEE,
        senderId,
        receiverId,
        courseId: null,
      },
      include: {
        sender: { select: { id: true, first_name: true, last_name: true, role: true } },
        receiver: { select: { id: true, first_name: true, last_name: true, role: true } },
      },
    });
    return message;
  }

  // ===== جيب رسائل الكورس (broadcast) =====
  async getCourseMessages(courseId: number, userId: number) {
    return this.prisma.message.findMany({
      where: { courseId, type: MessageType.COURSE_BROADCAST },
      include: {
        sender: { select: { id: true, first_name: true, last_name: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ===== جيب المحادثة بين طالب ومدرس في كورس =====
  async getConversationWithTeacher(studentId: number, courseId: number) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { unique_enrollment_student_course: { studentId, courseId } },
      include: { course: true },
    });
    if (!enrollment) return [];

    const teacherId = enrollment.course.teacherId;
    return this.prisma.message.findMany({
      where: {
        type: MessageType.TO_TEACHER,
        courseId,
        OR: [
          { senderId: studentId, receiverId: teacherId },
          { senderId: teacherId, receiverId: studentId },
        ],
      },
      include: {
        sender: { select: { id: true, first_name: true, last_name: true, role: true } },
        receiver: { select: { id: true, first_name: true, last_name: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ===== جيب المحادثة مع الموظف =====
  async getConversationWithEmployee(userId: number, otherId: number) {
    return this.prisma.message.findMany({
      where: {
        type: MessageType.TO_EMPLOYEE,
        OR: [
          { senderId: userId, receiverId: otherId },
          { senderId: otherId, receiverId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, first_name: true, last_name: true, role: true } },
        receiver: { select: { id: true, first_name: true, last_name: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ===== جيب قائمة الموظفين والمساعدين والمديرين (كل طاقم العمل) =====
  async getEmployees(studentId?: number) {
    const employees = await this.prisma.user.findMany({
      where: {
        role: { in: ['EMPLOYEE', 'ADMIN', 'ASSISTANT'] },
      },
      select: { id: true, first_name: true, last_name: true, email: true, role: true },
    });

    if (!studentId) return employees;

    // إضافة عدد الرسائل غير المقروءة لكل موظف بالنسبة للطالب ده
    const employeesWithCounts = await Promise.all(employees.map(async (emp) => {
      const unreadCount = await this.prisma.message.count({
        where: { senderId: emp.id, receiverId: studentId, isRead: false }
      });
      return { ...emp, unreadCount };
    }));

    return employeesWithCounts;
  }

  async getStudentCourses(studentId: number) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId },
      include: { course: { include: { teacher: true } } },
    });

    const coursesWithCounts = await Promise.all(enrollments.map(async (e) => {
      const course = e.course;
      const unreadCount = await this.prisma.message.count({
        where: { senderId: course.teacherId, receiverId: studentId, courseId: course.id, isRead: false }
      });
      return { ...course, unreadCount };
    }));

    return coursesWithCounts;
  }

  async getTeacherCourses(teacherId: number) {
    return this.prisma.course.findMany({ where: { teacherId } });
  }

  async getCourseStudents(courseId: number, teacherId: number) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, teacherId },
    });
    if (!course) throw new Error('غير مصرح لك بعرض طلاب هذا الكورس');

    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId },
      include: { user: { select: { id: true, first_name: true, last_name: true, role: true } } },
    });
    return enrollments.map(e => e.user);
  }

  async getTeacherStudentConversation(teacherId: number, studentId: number, courseId: number) {
    return this.prisma.message.findMany({
      where: {
        type: MessageType.TO_TEACHER,
        courseId,
        OR: [
          { senderId: studentId, receiverId: teacherId },
          { senderId: teacherId, receiverId: studentId },
        ],
      },
      include: {
        sender: { select: { id: true, first_name: true, last_name: true, role: true } },
        receiver: { select: { id: true, first_name: true, last_name: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async teacherReplyToStudent(teacherId: number, studentId: number, courseId: number, content: string, imageUrl?: string) {
    return this.prisma.message.create({
      data: { content, imageUrl, type: MessageType.TO_TEACHER, senderId: teacherId, receiverId: studentId, courseId },
      include: {
        sender: { select: { id: true, first_name: true, last_name: true, role: true } },
        receiver: { select: { id: true, first_name: true, last_name: true, role: true } },
      },
    });
  }

  async employeeReplyToStudent(employeeId: number, studentId: number, content: string, imageUrl?: string) {
    return this.prisma.message.create({
      data: { content, imageUrl, type: MessageType.TO_EMPLOYEE, senderId: employeeId, receiverId: studentId, courseId: null },
      include: {
        sender: { select: { id: true, first_name: true, last_name: true, role: true } },
        receiver: { select: { id: true, first_name: true, last_name: true, role: true } },
      },
    });
  }

  // ===== جيب إجمالي الرسائل غير المقروءة لمستخدم معين =====
  async getTotalUnreadCount(userId: number) {
    return this.prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
  }

  // ===== تمييز الرسائل كمقروءة =====
  async markAsRead(receiverId: number, senderId?: number, courseId?: number) {
    return this.prisma.message.updateMany({
      where: {
        receiverId,
        senderId: senderId || undefined,
        courseId: courseId || undefined,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  async getEmployeeInbox(employeeId: number) {
    const messages = await this.prisma.message.findMany({
      where: {
        type: MessageType.TO_EMPLOYEE,
        OR: [{ receiverId: employeeId }, { senderId: employeeId }],
      },
      include: {
        sender: { select: { id: true, first_name: true, last_name: true, role: true } },
        receiver: { select: { id: true, first_name: true, last_name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const conversationsMap = new Map<number, any>();
    for (const msg of messages) {
      const otherId = msg.senderId === employeeId ? msg.receiverId! : msg.senderId;
      if (!conversationsMap.has(otherId)) {
        // احسب عدد الرسائل غير المقروءة من هذا الشخص للموظف
        const unreadCount = await this.prisma.message.count({
          where: { senderId: otherId, receiverId: employeeId, isRead: false }
        });

        conversationsMap.set(otherId, {
          userId: otherId,
          user: msg.senderId === employeeId ? msg.receiver : msg.sender,
          lastMessage: msg,
          unreadCount
        });
      }
    }
    return Array.from(conversationsMap.values());
  }

  async getTeacherInbox(teacherId: number) {
    const messages = await this.prisma.message.findMany({
      where: {
        type: MessageType.TO_TEACHER,
        OR: [{ receiverId: teacherId }, { senderId: teacherId }],
      },
      include: {
        sender: { select: { id: true, first_name: true, last_name: true, role: true } },
        receiver: { select: { id: true, first_name: true, last_name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const conversationsMap = new Map<string, any>();
    for (const msg of messages) {
      const otherId = msg.senderId === teacherId ? msg.receiverId! : msg.senderId;
      const key = `${otherId}-${msg.courseId}`;
      if (!conversationsMap.has(key)) {
        const unreadCount = await this.prisma.message.count({
          where: { senderId: otherId, receiverId: teacherId, courseId: msg.courseId, isRead: false }
        });

        conversationsMap.set(key, {
          userId: otherId,
          courseId: msg.courseId,
          user: msg.senderId === teacherId ? msg.receiver : msg.sender,
          lastMessage: msg,
          unreadCount
        });
      }
    }
    return Array.from(conversationsMap.values());
  }

  // ===== جيب عدد الجهات اللي باعته رسائل غير مقروءة =====
  async getUnreadConversationsCount(userId: number) {
    const unreadMessages = await this.prisma.message.findMany({
      where: {
        receiverId: userId,
        isRead: false,
      },
      select: {
        senderId: true,
        courseId: true,
      },
    });

    const uniqueConversations = new Set();
    unreadMessages.forEach(msg => {
      // الجهة ممكن تكون شخص (senderId) أو كورس (courseId) في حالة الـ broadcast
      // بس في السيستم الحالي الـ broadcast ملوش receiverId محدد غالباً أو بيتحسب بطريقة تانية
      // هنركز على الـ senderId حالياً للـ TO_TEACHER و TO_EMPLOYEE
      if (msg.senderId) {
        uniqueConversations.add(`${msg.senderId}-${msg.courseId || 0}`);
      }
    });

    return uniqueConversations.size;
  }
}
