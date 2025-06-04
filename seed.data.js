const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema.Types;

// Sửa lại giá trong course
// Thêm syllabus trong course


// Kết nối MongoDB
const MONGODB_URI = 'mongodb+srv://lingora:lingora@lingora.j5sjikf.mongodb.net/?retryWrites=true&w=majority&appName=Lingora';

// Định nghĩa các schema
const UserSchema = new Schema({
    email: { type: String },
    passwordHash: { type: String },
    role: { type: String, enum: ['student', 'teacher', 'manager', 'admin'], default: 'student' },
    fullName: { type: String },
    profile: {
        specializations: { type: [String], default: [] },
        qualifications: { type: [String], default: [] },
        yearsOfExperience: { type: Number, default: null }
    },
    status: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null }
});

const CourseSchema = new Schema({
    code: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    language: { type: String, required: true },
    level: { type: String, required: true },
    durationWeeks: { type: Number, required: true },
    totalSlots: { type: Number, required: true },
    feeFull: { type: Number, required: true },
    feeInstallment: { type: Number, required: true },
    createdBy: { type: ObjectId, required: true, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    topics: { type: [String], default: [] }
});

const ClassSchema = new Schema({
    courseId: { type: ObjectId, required: true, ref: 'Course' },
    name: { type: String, required: true },
    teacherId: { type: ObjectId, required: true, ref: 'User' },
    schedule: [{
        dayOfWeek: { type: String, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
    }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    maxStudents: { type: Number, required: true },
    currentStudentCount: { type: Number, default: 0 },
    waitingListCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true }
});

const RegistrationSchema = new Schema({
    studentId: { type: ObjectId, required: true, ref: 'User' },
    classId: { type: ObjectId, required: true, ref: 'Class' },
    registrationDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'confirmed', 'canceled'], default: 'pending' },
    paymentPlan: { type: String, enum: ['full', 'installment'], default: 'full' },
    installment: {
        part1: { amount: { type: Number, required: true }, paidAt: { type: Date, default: null } },
        part2: { amount: { type: Number, required: true }, dueDate: { type: Date, default: null }, paidAt: { type: Date, default: null } }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null }
});

const WaitingListSchema = new Schema({
    studentId: { type: ObjectId, required: true, ref: 'User' },
    classId: { type: ObjectId, required: true, ref: 'Class' },
    requestDate: { type: Date, default: Date.now },
    priority: { type: Number, default: 0 },
    status: { type: String, enum: ['waiting', 'notified', 'moved'], default: 'waiting' },
    movedToClassId: { type: ObjectId, default: null },
    updatedAt: { type: Date, default: null }
});

const ScoreSchema = new Schema({
    classId: { type: ObjectId, required: true, ref: 'Class' },
    studentId: { type: ObjectId, required: true, ref: 'User' },
    scoreType: { type: String, enum: ['quiz', 'midterm', 'final', 'exercise', 'listening', 'speaking'], required: true },
    score: { type: Number, min: 0, max: 100, required: true },
    uploadedBy: { type: ObjectId, required: true, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
});

const AttendanceSchema = new Schema({
    classId: { type: ObjectId, required: true, ref: 'Class' },
    studentId: { type: ObjectId, required: true, ref: 'User' },
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent', 'late'], required: true },
    recordedBy: { type: ObjectId, required: true, ref: 'User' },
    recordedAt: { type: Date, default: Date.now }
});

const TeacherAbsentSchema = new Schema({
    teacherId: { type: ObjectId, required: true, ref: 'User' },
    classId: { type: ObjectId, required: true, ref: 'Class' },
    date: { type: Date, required: true },
    reason: { type: String, default: null },
    status: { type: String, enum: ['reported', 'confirmed', 'rejected'], required: true },
    reportedAt: { type: Date, default: null },
    confirmedBy: { type: ObjectId, default: null },
    confirmedAt: { type: Date, default: null },
    note: { type: String, default: null }
});

const QuestionBankSchema = new Schema({
    courseId: { type: ObjectId, required: true, ref: 'Course' },
    title: { type: String, required: true },
    createdBy: { type: ObjectId, required: true, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    questions: [{
        questionText: { type: String, required: true },
        options: { type: [String], default: [] },
        correctOptionIndex: { type: Number, default: null },
        type: { type: String, enum: ['mcq', 'essay', 'audio-mcq', 'audio-essay'], required: true }
    }]
});

const QuizSchema = new Schema({
    classId: { type: ObjectId, default: null, ref: 'Class' },
    title: { type: String, required: true },
    questions: [{
        questionText: { type: String, default: null },
        options: { type: [String], default: [] },
        correctOptionIndex: { type: Number, default: null },
        type: { type: String, enum: ['mcq', 'essay', 'audio-mcq', 'audio-essay'], default: null }
    }],
    generatedFromBank: { type: Boolean, default: false },
    bankId: { type: ObjectId, default: null },
    createdBy: { type: ObjectId, required: true, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    availableFrom: { type: Date, default: null },
    availableTo: { type: Date, default: null }
});

const QuizSubmissionSchema = new Schema({
    quizId: { type: ObjectId, required: true, ref: 'Quiz' },
    studentId: { type: ObjectId, required: true, ref: 'User' },
    answers: [{
        questionId: { type: ObjectId, required: true },
        selectedOption: { type: Number, default: null },
        answerText: { type: String, default: null },
        audioUploadUrl: { type: String, default: null }
    }],
    score: { type: Number, default: 0 },
    gradedBy: { type: ObjectId, default: null, ref: 'User' },
    gradedAt: { type: Date, default: null },
    submittedAt: { type: Date, default: null }
});

const ExerciseSchema = new Schema({
    classId: { type: ObjectId, required: true, ref: 'Class' },
    title: { type: String, required: true },
    description: { type: String, default: null },
    attachments: { type: [String], default: [] },
    createdBy: { type: ObjectId, required: true, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    dueDate: { type: Date, default: null }
});

const ExerciseSubmissionSchema = new Schema({
    exerciseId: { type: ObjectId, required: true, ref: 'Exercise' },
    studentId: { type: ObjectId, required: true, ref: 'User' },
    submittedAt: { type: Date, default: null },
    files: { type: [String], default: [] },
    grade: { type: Number, default: null },
    feedback: { type: String, default: null },
    gradedBy: { type: ObjectId, default: null }
});

const AIConversationSchema = new Schema({
    studentId: { type: ObjectId, required: true, ref: 'User' },
    courseId: { type: ObjectId, default: null, ref: 'Course' },
    timestamp: { type: Date, default: Date.now },
    messages: [{
        sender: { type: String, enum: ['student', 'ai'], required: true },
        messageText: { type: String, default: null },
        audioUrl: { type: String, default: null }
    }],
    durationSeconds: { type: Number, default: null },
    createdAt: { type: Date, default: Date.now }
});

const StudyMaterialSchema = new Schema({
    courseId: { type: ObjectId, required: true, ref: 'Course' },
    teacherId: { type: ObjectId, required: true, ref: 'User' },
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'ppt', 'docx', 'audio', 'video'], required: true },
    createdAt: { type: Date, default: Date.now }
});

const DiscussionSchema = new Schema({
    classId: { type: ObjectId, default: null },
    studentId: { type: ObjectId, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const FeedbackSchema = new Schema({
    fromStudentId: { type: ObjectId, required: true },
    targetType: { type: String, enum: ['teacher', 'center', 'ai', 'material'], required: true },
    targetId: { type: ObjectId, required: true },
    content: { type: String, required: true },
    rating: { type: Number, default: null },
    createdAt: { type: Date, default: Date.now }
});

const MessageSchema = new Schema({
    senderId: { type: ObjectId, required: true, ref: 'User' },
    receiverId: { type: ObjectId, default: null, ref: 'User' },
    classId: { type: ObjectId, default: null, ref: 'Class' },
    isAI: { type: Boolean, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false }
});

const NotificationSchema = new Schema({
    userId: { type: ObjectId, required: true, ref: 'User' },
    type: { type: String, enum: ['score_update', 'new_feedback', 'class_update', 'system', 'absence_confirmed', 'makeup_class'], required: true },
    message: { type: String, required: true },
    link: { type: String, default: null },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const RoomSchema = new Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['offline', 'online'], required: true },
    capacity: { type: Number, default: null },
    location: { type: String, default: null },
    meetLink: { type: String, default: null },
    createdBy: { type: ObjectId, required: true, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
});

const CalendarSchema = new Schema({
    userId: { type: ObjectId, required: true, ref: 'User' },
    events: [{
        title: { type: String, required: true },
        date: { type: Date, required: true },
        startTime: { type: String, default: null },
        endTime: { type: String, default: null },
        classId: { type: ObjectId, default: null, ref: 'Class' },
        roomId: { type: ObjectId, default: null, ref: 'Room' }
    }],
    updatedAt: { type: Date, default: null }
});

const PaymentSchema = new Schema({
    registrationId: { type: ObjectId, required: true, ref: 'Registration' },
    amount: { type: Number, required: true },
    paidBy: { type: ObjectId, required: true, ref: 'User' },
    paidAt: { type: Date, default: Date.now },
    invoiceNumber: { type: String, default: null },
    method: { type: String, enum: ['offline', 'manual_entry'], required: true, default: 'offline' },
    createdAt: { type: Date, default: Date.now }
});

// Helper functions
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomItems = (array, count) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

// Initial data
const adminUsers = [
    {
        email: 'admin@lingora.edu.vn',
        passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz',
        role: 'admin',
        fullName: 'System Administrator',
        status: 'active'
    },
    {
        email: 'manager1@lingora.edu.vn',
        passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz',
        role: 'manager',
        fullName: 'Academic Manager',
        status: 'active'
    }
];

const teacherData = [
    {
        email: 'sarah.wilson@lingora.edu.vn',
        fullName: 'Sarah Wilson',
        profile: {
            specializations: ['IELTS Speaking', 'IELTS Writing'],
            qualifications: ['CELTA', 'MA TESOL'],
            yearsOfExperience: 5
        },
        role: 'teacher',
        status: 'active'
    },
    {
        email: 'david.brown@lingora.edu.vn',
        fullName: 'David Brown',
        profile: {
            specializations: ['Business English', 'IELTS'],
            qualifications: ['DELTA', 'MBA'],
            yearsOfExperience: 8
        },
        role: 'teacher',
        status: 'active'
    }
];

const courseStructure = {
    'IELTS': {
        levels: [
            { name: 'Foundation', band: '3.5-4.5', code: 'IELTS-F' },
            { name: 'Intermediate', band: '4.5-5.5', code: 'IELTS-I' },
            { name: 'Upper-Intermediate', band: '5.5-6.5', code: 'IELTS-UI' },
            { name: 'Advanced', band: '6.5-7.5', code: 'IELTS-A' },
            { name: 'Expert', band: '7.5+', code: 'IELTS-E' }
        ],
        fee: {
            foundation: { full: 12000000, installment: 13000000 },
            intermediate: { full: 15000000, installment: 16000000 },
            upper: { full: 18000000, installment: 19000000 },
            advanced: { full: 21000000, installment: 22000000 },
            expert: { full: 25000000, installment: 26000000 }
        },
        duration: 12,
        topics: ['Listening', 'Speaking', 'Reading', 'Writing']
    },
    'Business English': {
        levels: [
            { name: 'Pre-Intermediate', code: 'BE-PI' },
            { name: 'Intermediate', code: 'BE-I' },
            { name: 'Upper-Intermediate', code: 'BE-UI' },
            { name: 'Advanced', code: 'BE-A' }
        ],
        fee: {
            preIntermediate: { full: 10000000, installment: 11000000 },
            intermediate: { full: 12000000, installment: 13000000 },
            upper: { full: 15000000, installment: 16000000 },
            advanced: { full: 18000000, installment: 19000000 }
        },
        duration: 10,
        topics: ['Business Communication', 'Presentation Skills', 'Negotiation', 'Email Writing']
    }
};

const scheduleTemplates = [
    [
        { dayOfWeek: 'Monday', startTime: '18:00', endTime: '20:00' },
        { dayOfWeek: 'Wednesday', startTime: '18:00', endTime: '20:00' }
    ],
    [
        { dayOfWeek: 'Tuesday', startTime: '18:00', endTime: '20:00' },
        { dayOfWeek: 'Thursday', startTime: '18:00', endTime: '20:00' }
    ]
];

// Initialize ID arrays
const userIds = { admin: [], manager: [], teacher: [], student: [] };
const courseIds = [];
const classIds = [];
const registrationIds = [];
const waitingListIds = [];
const scoreIds = [];
const attendanceIds = [];
const teacherAbsentIds = [];
const questionBankIds = [];
const quizIds = [];
const quizSubmissionIds = [];
const exerciseIds = [];
const exerciseSubmissionIds = [];
const aiConversationIds = [];
const studyMaterialIds = [];
const discussionIds = [];
const feedbackIds = [];
const messageIds = [];
const notificationIds = [];
const roomIds = [];
const calendarIds = [];
const paymentIds = [];

// Define models
const User = mongoose.model('User', UserSchema);
const Course = mongoose.model('Course', CourseSchema);
const Class = mongoose.model('Class', ClassSchema);
const Registration = mongoose.model('Registration', RegistrationSchema);
const WaitingList = mongoose.model('WaitingList', WaitingListSchema);
const Score = mongoose.model('Score', ScoreSchema);
const Attendance = mongoose.model('Attendance', AttendanceSchema);
const TeacherAbsent = mongoose.model('TeacherAbsent', TeacherAbsentSchema);
const QuestionBank = mongoose.model('QuestionBank', QuestionBankSchema);
const Quiz = mongoose.model('Quiz', QuizSchema);
const QuizSubmission = mongoose.model('QuizSubmission', QuizSubmissionSchema);
const Exercise = mongoose.model('Exercise', ExerciseSchema);
const ExerciseSubmission = mongoose.model('ExerciseSubmission', ExerciseSubmissionSchema);
const AIConversation = mongoose.model('AIConversation', AIConversationSchema);
const StudyMaterial = mongoose.model('StudyMaterial', StudyMaterialSchema);
const Discussion = mongoose.model('Discussion', DiscussionSchema);
const Feedback = mongoose.model('Feedback', FeedbackSchema);
const Message = mongoose.model('Message', MessageSchema);
const Notification = mongoose.model('Notification', NotificationSchema);
const Room = mongoose.model('Room', RoomSchema);
const Calendar = mongoose.model('Calendar', CalendarSchema);
const Payment = mongoose.model('Payment', PaymentSchema);

async function seedDatabase() {
    try {
        // Drop old database
        await mongoose.connection.dropDatabase();
        console.log('Database dropped');

        // Insert Users
        for (const admin of adminUsers) {
            const existingUser = await User.findOne({ email: admin.email });
            if (!existingUser) {
                const user = await User.create({
                    ...admin,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                userIds[admin.role].push(user._id);
                console.log(`Inserted user: ${admin.email}`);
            }
        }

        for (const teacher of teacherData) {
            const existingUser = await User.findOne({ email: teacher.email });
            if (!existingUser) {
                const user = await User.create({
                    ...teacher,
                    passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                userIds.teacher.push(user._id);
                console.log(`Inserted teacher: ${teacher.email}`);
            }
        }

        for (let i = 1; i <= 50; i++) {
            const email = `student${i}@example.com`;
            const existingUser = await User.findOne({ email });
            if (!existingUser) {
                const user = await User.create({
                    email,
                    passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz',
                    role: 'student',
                    fullName: `Student ${i}`,
                    gender: getRandomItem(['Male', 'Female']),
                    dateOfBirth: new Date(1995 + i % 10, i % 12, i % 28 + 1),
                    status: 'active',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                userIds.student.push(user._id);
                console.log(`Inserted student: ${email}`);
            }
        }

        // Insert Courses
        for (const [courseName, details] of Object.entries(courseStructure)) {
            for (const [index, level] of details.levels.entries()) {
                const courseCode = level.code;
                const existingCourse = await Course.findOne({ code: courseCode });
                if (!existingCourse) {
                    const course = await Course.create({
                        code: courseCode,
                        name: `${courseName} - ${level.name}`,
                        description: `${courseName} course for ${level.name} level students`,
                        language: 'English',
                        level: level.name,
                        durationWeeks: details.duration,
                        totalSlots: 20,
                        feeFull: details.fee[Object.keys(details.fee)[index]].full,
                        feeInstallment: details.fee[Object.keys(details.fee)[index]].installment,
                        createdBy: userIds.admin[0] || getRandomItem([...userIds.admin, ...userIds.manager]),
                        topics: details.topics,
                        isActive: true,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                    courseIds.push(course._id);
                    console.log(`Inserted course: ${courseCode}`);

                    // Insert QuestionBank
                    const existingQuestionBank = await QuestionBank.findOne({ title: `${courseName} - ${level.name} Question Bank` });
                    if (!existingQuestionBank) {
                        const questionBank = await QuestionBank.create({
                            courseId: course._id, // Sử dụng course._id trực tiếp
                            title: `${courseName} - ${level.name} Question Bank`,
                            createdBy: userIds.admin[0] || getRandomItem([...userIds.admin, ...userIds.manager]),
                            createdAt: new Date(),
                            questions: Array.from({ length: 10 }, (_, i) => ({
                                questionText: `Question ${i + 1} for ${courseName} - ${level.name}`,
                                options: ['A', 'B', 'C', 'D'],
                                correctOptionIndex: Math.floor(Math.random() * 4),
                                type: 'mcq'
                            }))
                        });
                        questionBankIds.push(questionBank._id);
                        console.log(`Inserted question bank for course: ${courseCode}`);
                    }
                }
            }
        }

        // Insert Classes
        for (const courseId of courseIds) {
            const course = await Course.findById(courseId);
            const courseName = course.name.split(' - ')[0];
            for (const [idx, schedule] of scheduleTemplates.entries()) {
                const className = `${course.code}-${String.fromCharCode(65 + idx)}`;
                const existingClass = await Class.findOne({ name: className });
                if (!existingClass) {
                    const teacherId = userIds.teacher.find(id => {
                        const teacher = teacherData.find(t => t.profile.specializations.includes(courseName));
                        return teacher && id.equals(teacher._id);
                    }) || getRandomItem(userIds.teacher);
                    const classDoc = await Class.create({
                        courseId,
                        name: className,
                        teacherId,
                        schedule,
                        startDate: new Date(2024, 5, 1),
                        endDate: new Date(2024, 5 + course.durationWeeks),
                        maxStudents: 20,
                        currentStudentCount: 0,
                        waitingListCount: 0,
                        isActive: true,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                    classIds.push(classDoc._id);
                    console.log(`Inserted class: ${className}`);

                    // Insert Registrations, Payments, Attendance, Scores, WaitingList
                    const classStudents = getRandomItems(userIds.student, 10);
                    for (const studentId of classStudents) {
                        const isInstallment = Math.random() > 0.5;
                        const existingRegistration = await Registration.findOne({
                            studentId,
                            classId: classDoc._id
                        });
                        if (!existingRegistration) {
                            const registration = await Registration.create({
                                studentId,
                                classId: classDoc._id,
                                registrationDate: new Date(),
                                status: 'confirmed',
                                paymentPlan: isInstallment ? 'installment' : 'full',
                                installment: {
                                    part1: {
                                        amount: isInstallment ? course.feeInstallment / 2 : course.feeFull,
                                        paidAt: new Date()
                                    },
                                    part2: {
                                        amount: isInstallment ? course.feeInstallment / 2 : 0,
                                        dueDate: isInstallment ? new Date(2024, 6, 1) : null,
                                        paidAt: null
                                    }
                                },
                                createdAt: new Date(),
                                updatedAt: new Date()
                            });
                            registrationIds.push(registration._id);
                            console.log(`Inserted registration for student ${studentId} in class ${className}`);

                            // Insert Payment
                            const existingPayment = await Payment.findOne({ registrationId: registration._id });
                            if (!existingPayment) {
                                const payment = await Payment.create({
                                    registrationId: registration._id,
                                    amount: isInstallment ? course.feeInstallment / 2 : course.feeFull,
                                    paidBy: studentId,
                                    paidAt: new Date(),
                                    invoiceNumber: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                                    method: 'offline',
                                    createdAt: new Date()
                                });
                                paymentIds.push(payment._id);
                                console.log(`Inserted payment for registration ${registration._id}`);
                            }

                            // Insert Attendance
                            for (let week = 0; week < 4; week++) {
                                const attendanceDate = new Date(2024, 5, week * 7 + 1);
                                const existingAttendance = await Attendance.findOne({
                                    classId: classDoc._id,
                                    studentId,
                                    date: attendanceDate
                                });
                                if (!existingAttendance) {
                                    const attendance = await Attendance.create({
                                        classId: classDoc._id,
                                        studentId,
                                        date: attendanceDate,
                                        status: getRandomItem(['present', 'present', 'present', 'absent', 'late']),
                                        recordedBy: teacherId,
                                        recordedAt: new Date()
                                    });
                                    attendanceIds.push(attendance._id);
                                    console.log(`Inserted attendance for student ${studentId} in class ${className}`);
                                }
                            }

                            // Insert Score
                            const existingScore = await Score.findOne({
                                classId: classDoc._id,
                                studentId,
                                scoreType: 'midterm'
                            });
                            if (!existingScore) {
                                const score = await Score.create({
                                    classId: classDoc._id,
                                    studentId,
                                    scoreType: 'midterm',
                                    score: Math.floor(Math.random() * 31) + 70,
                                    uploadedBy: teacherId,
                                    uploadedAt: new Date()
                                });
                                scoreIds.push(score._id);
                                console.log(`Inserted score for student ${studentId} in class ${className}`);
                            }
                        }
                    }

                    // Insert WaitingList
                    const waitingStudents = getRandomItems(userIds.student.filter(id => !classStudents.includes(id)), 3);
                    for (const studentId of waitingStudents) {
                        const existingWaitingList = await WaitingList.findOne({
                            studentId,
                            classId: classDoc._id
                        });
                        if (!existingWaitingList) {
                            const waitingList = await WaitingList.create({
                                studentId,
                                classId: classDoc._id,
                                requestDate: new Date(),
                                priority: Math.floor(Math.random() * 5),
                                status: 'waiting',
                                createdAt: new Date(),
                                updatedAt: new Date()
                            });
                            waitingListIds.push(waitingList._id);
                            console.log(`Inserted waiting list for student ${studentId} in class ${className}`);
                        }
                    }

                    // Insert TeacherAbsent
                    const absentDate = new Date(2024, 5, Math.floor(Math.random() * 28) + 1);
                    const existingTeacherAbsent = await TeacherAbsent.findOne({
                        teacherId,
                        classId: classDoc._id,
                        date: absentDate
                    });
                    if (!existingTeacherAbsent) {
                        const teacherAbsent = await TeacherAbsent.create({
                            teacherId,
                            classId: classDoc._id,
                            date: absentDate,
                            reason: 'Personal reason',
                            status: 'reported',
                            reportedAt: new Date(),
                            note: 'Pending approval',
                            createdAt: new Date()
                        });
                        teacherAbsentIds.push(teacherAbsent._id);
                        console.log(`Inserted teacher absent for teacher ${teacherId} in class ${className}`);
                    }

                    // Insert Quiz
                    const questionBank = await QuestionBank.findOne({ courseId });
                    if (questionBank) {
                        const existingQuiz = await Quiz.findOne({
                            classId: classDoc._id,
                            title: `Quiz for ${className}`
                        });
                        if (!existingQuiz) {
                            const quizQuestions = getRandomItems(questionBank.questions, 5).map(q => ({
                                questionText: q.questionText,
                                options: q.options,
                                correctOptionIndex: q.correctOptionIndex,
                                type: q.type
                            }));
                            const quiz = await Quiz.create({
                                classId: classDoc._id,
                                title: `Quiz for ${className}`,
                                questions: quizQuestions,
                                generatedFromBank: true,
                                bankId: questionBank._id,
                                createdBy: teacherId,
                                createdAt: new Date(),
                                availableFrom: new Date(),
                                availableTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                            });
                            quizIds.push(quiz._id);
                            console.log(`Inserted quiz for class ${className}`);

                            // Insert QuizSubmission
                            for (const studentId of classStudents.slice(0, 5)) {
                                const existingQuizSubmission = await QuizSubmission.findOne({
                                    quizId: quiz._id,
                                    studentId
                                });
                                if (!existingQuizSubmission) {
                                    const quizSubmission = await QuizSubmission.create({
                                        quizId: quiz._id,
                                        studentId,
                                        answers: quizQuestions.map(q => ({
                                            questionId: new mongoose.Types.ObjectId(),
                                            selectedOption: Math.floor(Math.random() * 4),
                                            answerText: null
                                        })),
                                        score: Math.floor(Math.random() * 41) + 60,
                                        gradedBy: teacherId,
                                        gradedAt: new Date(),
                                        submittedAt: new Date(),
                                        createdAt: new Date()
                                    });
                                    quizSubmissionIds.push(quizSubmission._id);
                                    console.log(`Inserted quiz submission for student ${studentId} in quiz ${quiz._id}`);
                                }
                            }
                        }
                    }

                    // Insert Exercise
                    const existingExercise = await Exercise.findOne({
                        classId: classDoc._id,
                        title: `Exercise for ${className}`
                    });
                    if (!existingExercise) {
                        const exercise = await Exercise.create({
                            classId: classDoc._id,
                            title: `Exercise for ${className}`,
                            description: `Exercise for ${className}`,
                            attachments: [`https://example.com/exercise-${classDoc._id}.pdf`],
                            createdBy: teacherId,
                            createdAt: new Date(),
                            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        });
                        exerciseIds.push(exercise._id);
                        console.log(`Inserted exercise for class ${className}`);

                        // Insert ExerciseSubmission
                        for (const studentId of classStudents.slice(0, 5)) {
                            const existingExerciseSubmission = await ExerciseSubmission.findOne({
                                exerciseId: exercise._id,
                                studentId
                            });
                            if (!existingExerciseSubmission) {
                                const exerciseSubmission = await ExerciseSubmission.create({
                                    exerciseId: exercise._id,
                                    studentId,
                                    submittedAt: new Date(),
                                    files: [`https://example.com/submission-${studentId}.pdf`],
                                    grade: Math.floor(Math.random() * 41) + 60,
                                    feedback: 'Good effort',
                                    gradedBy: teacherId,
                                    createdAt: new Date()
                                });
                                exerciseSubmissionIds.push(exerciseSubmission._id);
                                console.log(`Inserted exercise submission for student ${studentId} in exercise ${exercise._id}`);
                            }
                        }
                    }
                }
            }
        }

        // Insert AIConversations
        for (const studentId of getRandomItems(userIds.student, 10)) {
            const courseId = getRandomItem(courseIds);
            const existingAIConversation = await AIConversation.findOne({
                studentId,
                courseId
            });
            if (!existingAIConversation) {
                const aiConversation = await AIConversation.create({
                    studentId,
                    courseId,
                    timestamp: new Date(),
                    messages: [
                        { sender: 'student', messageText: 'Hello, I need help with IELTS Writing' },
                        { sender: 'ai', messageText: 'Sure, practice Task 1!' }
                    ],
                    durationSeconds: Math.floor(Math.random() * 300) + 60,
                    createdAt: new Date()
                });
                aiConversationIds.push(aiConversation._id);
                console.log(`Inserted AI conversation for student ${studentId}`);
            }
        }

        // Insert StudyMaterials
        for (const courseId of courseIds) {
            const course = await Course.findById(courseId);
            const existingMaterial = await StudyMaterial.findOne({
                courseId,
                title: `${course.name} Material`
            });
            if (!existingMaterial) {
                const material = await StudyMaterial.create({
                    courseId,
                    teacherId: getRandomItem(userIds.teacher),
                    title: `${course.name} Material`,
                    fileUrl: `https://example.com/materials/${course.code}.pdf`,
                    fileType: 'pdf',
                    createdAt: new Date()
                });
                studyMaterialIds.push(material._id);
                console.log(`Inserted study material for course ${course.code}`);
            }
        }

        // Insert Discussions
        for (const classId of classIds) {
            const classStudents = await Registration.find({ classId }).distinct('studentId');
            for (const studentId of getRandomItems(classStudents, Math.min(3, classStudents.length))) {
                const existingDiscussion = await Discussion.findOne({
                    classId,
                    studentId
                });
                if (!existingDiscussion) {
                    const discussion = await Discussion.create({
                        classId,
                        studentId,
                        content: `Discussion about class ${classId}`,
                        createdAt: new Date()
                    });
                    discussionIds.push(discussion._id);
                    console.log(`Inserted discussion for class ${classId} by student ${studentId}`);
                }
            }
        }

        // Insert Feedback
        for (const classId of classIds) {
            const classStudents = await Registration.find({ classId }).distinct('studentId');
            for (const studentId of getRandomItems(classStudents, 2)) {
                const teacherId = (await Class.findById(classId)).teacherId;
                const existingFeedback = await Feedback.findOne({
                    fromStudentId: studentId,
                    targetType: 'teacher',
                    targetId: teacherId
                });
                if (!existingFeedback) {
                    const feedback = await Feedback.create({
                        fromStudentId: studentId,
                        targetType: 'teacher',
                        targetId: teacherId,
                        content: `Feedback for teacher in class ${classId}`,
                        rating: Math.floor(Math.random() * 5) + 1,
                        createdAt: new Date()
                    });
                    feedbackIds.push(feedback._id);
                    console.log(`Inserted feedback for teacher ${teacherId} by student ${studentId}`);
                }
            }
        }

        // Insert Messages
        for (const classId of classIds) {
            const classStudents = await Registration.find({ classId }).distinct('studentId');
            const teacherId = (await Class.findById(classId)).teacherId;
            for (const studentId of getRandomItems(classStudents, 2)) {
                const existingMessage = await Message.findOne({
                    senderId: studentId,
                    receiverId: teacherId,
                    classId
                });
                if (!existingMessage) {
                    const message = await Message.create({
                        senderId: studentId,
                        receiverId: teacherId,
                        classId,
                        isAI: false,
                        content: `Question about class ${classId}`,
                        timestamp: new Date(),
                        isRead: false,
                        createdAt: new Date()
                    });
                    messageIds.push(message._id);
                    console.log(`Inserted message from student ${studentId} to teacher ${teacherId}`);
                }
            }
        }

        // Insert Notifications
        for (const studentId of userIds.student) {
            const existingNotification = await Notification.findOne({
                userId: studentId,
                type: 'class_update'
            });
            if (!existingNotification) {
                const notification = await Notification.create({
                    userId: studentId,
                    type: 'class_update',
                    message: 'Your class schedule has been updated',
                    link: '/dashboard/classes',
                    isRead: false,
                    createdAt: new Date()
                });
                notificationIds.push(notification._id);
                console.log(`Inserted notification for student ${studentId}`);
            }
        }

        // Insert Rooms
        const roomNames = ['P101', 'P102', 'Online Room A', 'Online Room B'];
        for (const name of roomNames) {
            const existingRoom = await Room.findOne({ name });
            if (!existingRoom) {
                const room = await Room.create({
                    name,
                    type: name.includes('Online') ? 'online' : 'offline',
                    capacity: name.includes('Online') ? null : Math.floor(Math.random() * 20) + 10,
                    location: name.includes('Online') ? null : `Tầng ${Math.floor(Math.random() * 5) + 1}, dãy A`,
                    meetLink: name.includes('Online') ? `https://meet.google.com/room-${Math.random().toString(36).substr(2, 8)}` : null,
                    createdBy: userIds.manager[0] || userIds.admin[0],
                    createdAt: new Date(),
                    isActive: true
                });
                roomIds.push(room._id);
                console.log(`Inserted room: ${name}`);
            }
        }

        // Insert Calendars
        for (const userId of [...userIds.student, ...userIds.teacher]) {
            const existingCalendar = await Calendar.findOne({ userId });
            if (!existingCalendar) {
                const userClasses = await Class.find({
                    $or: [
                        { teacherId: userId },
                        { _id: { $in: await Registration.find({ studentId: userId }).distinct('classId') } }
                    ]
                });
                const events = [];
                for (const cls of userClasses) {
                    for (const schedule of cls.schedule) {
                        events.push({
                            title: `Class ${cls.name}`,
                            date: cls.startDate,
                            startTime: schedule.startTime,
                            endTime: schedule.endTime,
                            classId: cls._id,
                            roomId: getRandomItem(roomIds)
                        });
                    }
                }
                if (events.length > 0) {
                    const calendar = await Calendar.create({
                        userId,
                        events,
                        updatedAt: new Date()
                    });
                    calendarIds.push(calendar._id);
                    console.log(`Inserted calendar for user ${userId}`);
                }
            }
        }

        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
}

// Execute
mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('Đã kết nối với MongoDB...');
        await seedDatabase();
        console.log('Đã hoàn thành việc tạo dữ liệu!');
    })
    .catch(err => {
        console.error('Lỗi:', err);
    })
    .finally(() => {
        mongoose.disconnect();
    });