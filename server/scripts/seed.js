require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import all models
const User = require('../models/user.model');
const Category = require('../models/category.model');
const Course = require('../models/course.model');
const CourseSection = require('../models/section.model');
const Lesson = require('../models/lesson.model');
const LearningMaterial = require('../models/material.model');
const KnowledgeDocument = require('../models/knowledgeDocument.model');
const Assignment = require('../models/assignment.model');
const Quiz = require('../models/quiz.model');
const Question = require('../models/question.model');
const Enrollment = require('../models/enrollment.model');
const Submission = require('../models/submission.model');
const QuizAttempt = require('../models/quizAttempt.model');
const StudyPlan = require('../models/studyPlan.model');
const StudyPlanTask = require('../models/studyPlanTask.model');
const LearningProfile = require('../models/learningProfile.model');
const LearningRecommendation = require('../models/learningRecommendation.model');

const { hashPassword } = require('../services/password.service');

// Ensure upload directories exist
const docsDir = path.join(__dirname, '../uploads/documents');
const pdfsDir = path.join(__dirname, '../uploads/pdfs');
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
if (!fs.existsSync(pdfsDir)) fs.mkdirSync(pdfsDir, { recursive: true });

// Helper to write sample material file to disk
const createMaterialFile = (relPath, content) => {
  const fullPath = path.join(__dirname, '../uploads', relPath);
  fs.writeFileSync(fullPath, content, 'utf8');
  return `/uploads/${relPath.replace(/\\/g, '/')}`;
};

const seedUsers = [
  {
    name: 'System Administrator',
    email: 'admin@lms.com',
    password: 'AdminPassword123!',
    role: 'Admin',
    status: 'Active',
    isVerified: true
  },
  {
    name: 'Prof. Sarah Jenkins',
    email: 'sarah.jenkins@lms.com',
    password: 'FacultyPassword123!',
    role: 'Faculty',
    status: 'Active',
    isVerified: true
  },
  {
    name: 'Dr. Robert Chen',
    email: 'robert.chen@lms.com',
    password: 'FacultyPassword123!',
    role: 'Faculty',
    status: 'Active',
    isVerified: true
  },
  {
    name: 'Prof. Alan Turing',
    email: 'alan.turing@lms.com',
    password: 'FacultyPassword123!',
    role: 'Faculty',
    status: 'Active',
    isVerified: true
  },
  {
    name: 'Dr. Emily Watson',
    email: 'emily.watson@lms.com',
    password: 'FacultyPassword123!',
    role: 'Faculty',
    status: 'Active',
    isVerified: true
  },
  {
    name: 'Alex Johnson',
    email: 'student@lms.com',
    password: 'StudentPassword123!',
    role: 'Student',
    status: 'Active',
    isVerified: true
  },
  {
    name: 'Maria Garcia',
    email: 'maria.garcia@lms.com',
    password: 'StudentPassword123!',
    role: 'Student',
    status: 'Active',
    isVerified: true
  },
  {
    name: 'David Kim',
    email: 'david.kim@lms.com',
    password: 'StudentPassword123!',
    role: 'Student',
    status: 'Active',
    isVerified: true
  }
];

const seedCategories = [
  {
    name: 'Computer Science & Engineering',
    description: 'Operating Systems, Data Structures, Algorithms, Databases, and Core Theory',
    icon: 'Code'
  },
  {
    name: 'Artificial Intelligence & Data Science',
    description: 'Machine Learning, Neural Networks, Deep Learning, Statistics, and Big Data',
    icon: 'Brain'
  },
  {
    name: 'Software Engineering & Cloud Systems',
    description: 'Agile Lifecycles, UML Design Patterns, Microservices, and DevOps',
    icon: 'Globe'
  },
  {
    name: 'Cybersecurity & Network Systems',
    description: 'Network Protocols, Cryptography, OWASP Web Defense, and Ethical Hacking',
    icon: 'Shield'
  },
  {
    name: 'Computer Hardware & Digital Systems',
    description: 'Logic Design, Circuits, RISC-V Architecture, and Computer Organization',
    icon: 'Cpu'
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-lms';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB:', mongoUri);

    // 1. Seed Users
    const userMap = {};
    for (const userData of seedUsers) {
      let user = await User.findOne({ email: userData.email.toLowerCase() });
      const hashedPassword = await hashPassword(userData.password);

      if (user) {
        user.name = userData.name;
        user.password = hashedPassword;
        user.role = userData.role;
        user.status = userData.status;
        user.isVerified = userData.isVerified;
        await user.save();
      } else {
        user = await User.create({
          ...userData,
          email: userData.email.toLowerCase(),
          password: hashedPassword
        });
      }
      userMap[userData.email.toLowerCase()] = user._id;
      if (userData.role === 'Admin' && !userMap['Admin']) userMap['Admin'] = user._id;
      console.log(`[Seed] User ready (${userData.role}): ${userData.email}`);
    }

    const mainStudentId = userMap['student@lms.com'];
    const adminId = userMap['Admin'];

    // 2. Seed Categories
    const categoryMap = {};
    for (const catData of seedCategories) {
      let category = await Category.findOne({ name: catData.name });
      if (!category) {
        category = await Category.create({
          ...catData,
          createdBy: adminId
        });
      }
      categoryMap[category.name] = category._id;
      console.log(`[Seed] Category ready: ${category.name}`);
    }

    // 3. Define Degree Courses with complete real-world subjects and materials
    const coursesDefinition = [
      {
        course: {
          title: 'Operating Systems & Kernel Architecture',
          code: 'CS-301',
          shortDescription: 'Master process management, memory paging, concurrency, and Linux kernel internals.',
          fullDescription: 'This degree-level course covers the principles and design of modern operating systems. Topics include process control blocks, CPU scheduling algorithms, thread synchronization primitives (mutexes, semaphores), virtual memory, page replacement, file system structures (inodes), and device driver inter-process communication.',
          category: categoryMap['Computer Science & Engineering'],
          level: 'Intermediate',
          duration: '14 Weeks',
          language: 'English',
          instructor: userMap['robert.chen@lms.com'],
          status: 'Published',
          tags: ['Operating Systems', 'Kernel', 'C/C++', 'Process Scheduling', 'Virtual Memory'],
          learningOutcomes: [
            'Understand process context switching and PCB lifecycle',
            'Implement thread synchronization using semaphores and mutexes',
            'Analyze virtual memory demand paging and page replacement algorithms',
            'Design file system layouts with inode tables and directory structures'
          ],
          prerequisites: ['Data Structures & Algorithms', 'C Systems Programming'],
          createdBy: adminId
        },
        sections: [
          {
            title: 'Module 1: Operating System Architectures & System Calls',
            description: 'Kernel modes, monolithic vs microkernel architecture, and POSIX system call interface.',
            lessons: [
              {
                title: 'Lesson 1.1: Monolithic vs Microkernel Design Principles',
                description: 'Detailed analysis of Linux kernel vs Mach microkernel paradigms.',
                contentType: 'Text Note',
                duration: '25 mins',
                textNote: `# Monolithic vs Microkernel Architecture

## Overview
An Operating System kernel operates as the core bridge between hardware components and user application software.

### Monolithic Kernels (e.g., Linux, FreeBSD)
In a monolithic kernel, all operating system services run within a single unified kernel address space:
- Memory management
- Process scheduling
- File system drivers
- Hardware device drivers

**Advantages:** High execution speed due to direct function calls without IPC context switches.
**Disadvantages:** A crash in a single device driver can panic the entire operating system kernel.

### Microkernels (e.g., Mach, L4, QNX)
Microkernels move non-essential services (like file systems and drivers) out of the kernel into user-space daemons.
- Only Inter-Process Communication (IPC), low-level memory management, and basic scheduling remain in kernel space.

**Advantages:** High reliability, fault isolation, and modularity.
**Disadvantages:** Inter-process communication overhead for system service requests.`,
                material: {
                  fileName: 'OS_Module1_Kernel_Architecture_Guide.txt',
                  fileType: 'Document',
                  relPath: 'documents/OS_Module1_Kernel_Architecture_Guide.txt',
                  content: 'OPERATING SYSTEMS DEGREE LECTURE HANDOUT\n\nChapter 1: Kernel Architectures & Inter-Process Communication\n\nA monolithic kernel executes memory management, IPC, process scheduling, file system drivers, and hardware interface drivers in a single privileged kernel memory ring (Ring 0). System calls (e.g., fork(), execve(), read(), write()) transition execution from Ring 3 (User Space) to Ring 0 (Kernel Space) via software interrupts (int 0x80 or syscall assembly instruction).\n\nKey POSIX System Calls:\n1. fork(): Clones current process duplicating PCB entries.\n2. execve(): Overwrites process memory space with new ELF executable.\n3. waitpid(): Blocks parent until child process completes.\n4. mmap(): Maps files or devices into memory page space.'
                }
              },
              {
                title: 'Lesson 1.2: System Call Execution & Dual-Mode CPU Operation',
                description: 'Traps, hardware interrupts, and user to kernel space context switching.',
                contentType: 'PDF',
                duration: '30 mins',
                material: {
                  fileName: 'OS_SystemCall_Mechanics_LectureNotes.txt',
                  fileType: 'PDF',
                  relPath: 'pdfs/OS_SystemCall_Mechanics_LectureNotes.txt',
                  content: 'SYSTEM CALL MECHANICS & CPU DUAL-MODE EXECUTION\n\nModern CPUs support hardware execution modes: User Mode (Unprivileged, Ring 3) and Kernel Mode (Privileged, Ring 0).\n\nWhen a user application invokes read(fd, buf, count):\n1. Parameters are passed into CPU registers (e.g., RAX=0 for sys_read).\n2. A software interrupt trap instruction is executed.\n3. The CPU hardware switches execution privilege level to Ring 0.\n4. The Kernel Interrupt Vector Table (IVT) resolves the handler address sys_read.\n5. Upon completion, sys_ret restores user registers and returns to Ring 3.'
                }
              }
            ]
          },
          {
            title: 'Module 2: Process Scheduling & Concurrency Control',
            description: 'CPU scheduling algorithms, critical sections, semaphores, and race conditions.',
            lessons: [
              {
                title: 'Lesson 2.1: CPU Scheduling: FCFS, SJF, Round Robin & Multi-Level Queue',
                description: 'Preemptive vs non-preemptive scheduling strategies and mathematical Gantt charts.',
                contentType: 'Text Note',
                duration: '35 mins',
                textNote: `# CPU Scheduling Algorithms & Metrics

## Turnaround Time & Waiting Time Metrics
- **Turnaround Time (TAT):** $TAT = Completion\\ Time - Arrival\\ Time$
- **Waiting Time (WT):** $WT = Turnaround\\ Time - Burst\\ Time$

## Scheduling Algorithms
1. **First-Come, First-Served (FCFS):** Non-preemptive. Suffers from the *Convoy Effect*.
2. **Shortest Job First (SJF) / SRTF:** Optimal average waiting time. Requires knowing future CPU burst times.
3. **Round Robin (RR):** Preemptive scheduling using fixed Time Quantum slices. Ideal for time-sharing systems.
4. **Completely Fair Scheduler (CFS):** Linux kernel scheduler using Red-Black trees to track virtual runtime (vruntime).`,
                material: {
                  fileName: 'OS_Process_Scheduling_Handout.txt',
                  fileType: 'Document',
                  relPath: 'documents/OS_Process_Scheduling_Handout.txt',
                  content: 'CPU SCHEDULING & MULTI-THREAD CONCURRENCY HANDOUT\n\nProcess Control Block (PCB) contains:\n- Process ID (PID)\n- Process State (Running, Ready, Waiting, Terminated)\n- CPU Registers & Stack Pointer\n- Memory Management info (Page Tables)\n- Open File Descriptors\n\nRace Condition Example:\nTwo threads increment a shared counter counter++ concurrently. At assembly level, counter++ consists of:\n1. MOV EAX, [counter]\n2. ADD EAX, 1\n3. MOV [counter], EAX\nWithout mutual exclusion primitives (Mutex), context switches between steps 1 and 3 cause lost updates.'
                }
              },
              {
                title: 'Lesson 2.2: Semaphores, Mutex Locks & Dining Philosophers Problem',
                description: 'Synchronization solutions using counting semaphores and monitors.',
                contentType: 'PDF',
                duration: '40 mins',
                material: {
                  fileName: 'OS_Concurrency_Semaphores_Paper.txt',
                  fileType: 'PDF',
                  relPath: 'pdfs/OS_Concurrency_Semaphores_Paper.txt',
                  content: 'SYNCHRONIZATION & SEMAPHORE MATHEMATICAL SPECIFICATION\n\nA Semaphore S is an integer variable accessed through two atomic operations:\n- wait(S) or P(S): decrement S. If S < 0, block calling thread.\n- signal(S) or V(S): increment S. If threads blocked, unblock one.\n\nBanker\'s Algorithm for Deadlock Avoidance:\nRequires tracking Max Demand, Allocation, and Need matrices.\nState is SAFE if there exists a sequence <P1, P2, ..., Pn> of process execution where Need[i] <= Available + sum(Allocated).'
                }
              }
            ]
          },
          {
            title: 'Module 3: Memory Management & Virtual Memory Paging',
            description: 'Page tables, translation lookaside buffer (TLB), and page replacement algorithms.',
            lessons: [
              {
                title: 'Lesson 3.1: Virtual Memory, Demand Paging & Page Fault Handling',
                description: 'Logical to physical address translation, Page Tables, and TLB caches.',
                contentType: 'Text Note',
                duration: '30 mins',
                textNote: `# Virtual Memory & Page Address Translation

## Address Translation Pipeline
Logical Virtual Address (VA) is split into: **Page Number (p)** and **Offset (d)**.

1. CPU checks Translation Lookaside Buffer (TLB) cache for Page Number *p*.
2. **TLB Hit:** Physical Frame Number *f* returned immediately. Physical Address = $f \\times Page\\ Size + d$.
3. **TLB Miss:** CPU reads Page Table entry in RAM.
   - If Valid Bit = 1: Frame number acquired, TLB updated.
   - If Valid Bit = 0: **Page Fault Exception** triggered!

## Page Fault Resolution Sequence
1. Kernel traps exception and checks if virtual address is valid.
2. Kernel locates page on disk backing store (Swap Space).
3. Kernel allocates free physical RAM frame (or executes page replacement if RAM full).
4. Disk I/O reads page into RAM frame.
5. Page Table entry updated, Valid Bit set to 1, instruction restarted.`
              }
            ]
          }
        ],
        assignments: [
          {
            title: 'Assignment 1: Multithreaded Process Scheduler in C',
            description: 'Implement a Round-Robin and Priority CPU scheduler in C with thread synchronization primitives.',
            instructions: 'Write a C program that reads a trace of process arrival times, burst times, and priorities. Simulate Round-Robin scheduling with quantum=4ms and output average waiting time and turnaround time. Include clean comments.',
            maxMarks: 100,
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            allowedFileTypes: ['c', 'cpp', 'pdf', 'zip'],
            aiGradingPrompt: 'Grade student C program on correctness of Gantt scheduling math, thread lock usage, handling edge cases, and memory leak prevention.'
          },
          {
            title: 'Assignment 2: Virtual Memory Page Replacement Simulator',
            description: 'Implement LRU, FIFO, and Optimal Page Replacement algorithms and benchmark page fault rates.',
            instructions: 'Implement a simulator that accepts a page reference string (e.g. 7, 0, 1, 2, 0, 3, 0, 4) and frame sizes (3 to 6). Calculate total page faults for FIFO, LRU, and Optimal algorithms. Submit source code and a PDF analysis report.',
            maxMarks: 100,
            deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
            allowedFileTypes: ['py', 'cpp', 'pdf', 'zip'],
            aiGradingPrompt: 'Evaluate simulation logic for exact match with textbook page replacement step-by-step trace and clarity of comparison graph.'
          }
        ],
        quizzes: [
          {
            title: 'OS Mid-Term Examination: Processes, Threads & CPU Scheduling',
            description: 'Test your understanding of kernel architecture, PCB context switching, and scheduling math.',
            durationMinutes: 30,
            passingMarks: 60,
            questions: [
              {
                question: 'Which of the following kernel components runs in privileged execution mode (Ring 0) in a monolithic operating system?',
                type: 'Multiple Choice',
                options: ['Device Drivers', 'File Systems', 'Process Scheduler', 'All of the above'],
                correctAnswer: 'All of the above',
                explanation: 'In a monolithic architecture, all OS services including file systems, schedulers, and device drivers reside in kernel space (Ring 0).',
                marks: 10,
                difficulty: 'Easy'
              },
              {
                question: 'What is the primary advantage of Round-Robin (RR) CPU scheduling over First-Come First-Served (FCFS)?',
                type: 'Multiple Choice',
                options: [
                  'RR minimizes total context switching overhead',
                  'RR prevents long processes from starving shorter processes (eliminates Convoy Effect)',
                  'RR always guarantees zero waiting time for all processes',
                  'RR requires no hardware timer interrupts'
                ],
                correctAnswer: 'RR prevents long processes from starving shorter processes (eliminates Convoy Effect)',
                explanation: 'Round-Robin uses time slicing, allowing ready processes fair access to the CPU and mitigating the convoy effect of FCFS.',
                marks: 10,
                difficulty: 'Medium'
              },
              {
                question: 'In Unix, what value does the fork() system call return to the newly created child process?',
                type: 'Multiple Choice',
                options: ['The Parent PID', '0', '-1', 'The Child PID'],
                correctAnswer: '0',
                explanation: 'fork() returns 0 to the child process and returns the PID of the child to the parent process.',
                marks: 10,
                difficulty: 'Medium'
              },
              {
                question: 'True or False: A Semaphore with an initial value of 1 acts as a Binary Semaphore (Mutex).',
                type: 'True/False',
                options: ['True', 'False'],
                correctAnswer: 'True',
                explanation: 'A counting semaphore initialized to 1 can only take values 1 (unlocked) or 0 (locked), functioning identically to a mutex.',
                marks: 10,
                difficulty: 'Easy'
              },
              {
                question: 'Which page replacement algorithm suffers from Belady\'s Anomaly?',
                type: 'Multiple Choice',
                options: ['Optimal (OPT)', 'Least Recently Used (LRU)', 'First-In First-Out (FIFO)', 'Clock Algorithm'],
                correctAnswer: 'First-In First-Out (FIFO)',
                explanation: 'Belady\'s Anomaly states that for FIFO page replacement, increasing page frames can paradoxically increase page faults.',
                marks: 10,
                difficulty: 'Hard'
              }
            ]
          }
        ]
      },
      {
        course: {
          title: 'Database Management Systems & Relational Architecture',
          code: 'CS-202',
          shortDescription: 'Master relational model, SQL queries, ER diagrams, 3NF/BCNF normalization, and ACID transactions.',
          fullDescription: 'Comprehensive degree course on relational databases. Focuses on entity-relationship modeling, relational algebra, SQL optimization, functional dependencies, 1NF to BCNF normalization, B+ Tree indexing, multi-version concurrency control (MVCC), and Write-Ahead Logging.',
          category: categoryMap['Computer Science & Engineering'],
          level: 'Intermediate',
          duration: '12 Weeks',
          language: 'English',
          instructor: userMap['robert.chen@lms.com'],
          status: 'Published',
          tags: ['DBMS', 'SQL', 'Normalization', 'Relational Algebra', 'ACID', 'Transactions'],
          learningOutcomes: [
            'Design high-performance ER and Relational schemas',
            'Perform schema normalization up to BCNF removing update/delete anomalies',
            'Write complex SQL queries using window functions and CTEs',
            'Analyze transaction concurrency control using 2PL and isolation levels'
          ],
          prerequisites: ['Basic Programming Principles'],
          createdBy: adminId
        },
        sections: [
          {
            title: 'Module 1: Relational Data Model & Advanced SQL',
            description: 'Relational algebra, DDL/DML, joins, subqueries, and window functions.',
            lessons: [
              {
                title: 'Lesson 1.1: Relational Algebra Operators & Calculus',
                description: 'Selection, Projection, Cartesian Product, Join, and Set Operators.',
                contentType: 'Text Note',
                duration: '30 mins',
                textNote: `# Relational Algebra Fundamentals

## Procedural Query Language Primitives
1. **Selection ($\\sigma$):** Filters rows meeting predicate condition $\\sigma_{age > 21}(Students)$.
2. **Projection ($\\pi$):** Selects specific columns $\\pi_{name, email}(Students)$.
3. **Cartesian Product ($\\times$):** Combines every tuple of R with every tuple of S.
4. **Natural Join ($\\bowtie$):** Combines matching tuples based on common attribute names.
5. **Theta Join ($\\bowtie_{\\theta}$):** Joins tuples satisfying arbitrary predicate $\\theta$.`,
                material: {
                  fileName: 'DBMS_Module1_Relational_Algebra_Guide.txt',
                  fileType: 'Document',
                  relPath: 'documents/DBMS_Module1_Relational_Algebra_Guide.txt',
                  content: 'DBMS DEGREE HANDOUT\n\nRelational Model Core Axioms:\n1. Relations are set of tuples (unordered).\n2. Candidate Key: Minimal superkey uniquely identifying a tuple.\n3. Primary Key: Selected candidate key.\n4. Foreign Key: Attribute in relation referencing Primary Key of another relation enforcing Referential Integrity.\n\nSQL Execution Order:\n1. FROM / JOIN\n2. WHERE\n3. GROUP BY\n4. HAVING\n5. SELECT\n6. DISTINCT\n7. ORDER BY\n8. LIMIT / OFFSET'
                }
              }
            ]
          },
          {
            title: 'Module 2: Schema Normalization & Functional Dependencies',
            description: 'Functional dependencies, Armstrong axioms, 1NF, 2NF, 3NF, and BCNF.',
            lessons: [
              {
                title: 'Lesson 2.1: Normalization Algorithms (1NF to BCNF)',
                description: 'Decomposition without loss of data or functional dependencies.',
                contentType: 'PDF',
                duration: '40 mins',
                material: {
                  fileName: 'DBMS_Normalization_3NF_BCNF_Guide.txt',
                  fileType: 'PDF',
                  relPath: 'pdfs/DBMS_Normalization_3NF_BCNF_Guide.txt',
                  content: 'DATABASE NORMALIZATION DEGREE REFERENCE\n\n1NF: All attributes contain atomic values (no nested relations or array lists).\n2NF: Relation is in 1NF and no non-prime attribute is partially dependent on any candidate key.\n3NF: Relation is in 2NF and no non-prime attribute is transitively dependent on candidate keys (If X -> Y, then X is Superkey or Y is Prime attribute).\nBCNF: For every functional dependency X -> Y, X MUST be a Superkey.\n\nDecomposition Properties:\n- Lossless Join Guarantee: R1 INTERSECT R2 -> R1 or R1 INTERSECT R2 -> R2.\n- Dependency Preservation Guarantee.'
                }
              }
            ]
          }
        ],
        assignments: [
          {
            title: 'Assignment 1: Enterprise Schema Design & 3NF Normalization',
            description: 'Transform an unnormalized university registrar dataset into 3NF and BCNF schemas.',
            instructions: 'Analyze given flat CSV dataset of student course enrollments, instructor assignments, and grades. Identify all Functional Dependencies. Prove step-by-step decomposition into 1NF, 2NF, and 3NF relations. Create SQL DDL scripts with primary/foreign keys.',
            maxMarks: 100,
            deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            allowedFileTypes: ['sql', 'pdf', 'zip'],
            aiGradingPrompt: 'Verify functional dependency correctness, lossless join decomposition proof, and SQL DDL constraint definitions.'
          }
        ],
        quizzes: [
          {
            title: 'DBMS Normalization & SQL Master Quiz',
            description: 'Test knowledge on candidate keys, normal forms, and SQL execution order.',
            durationMinutes: 25,
            passingMarks: 60,
            questions: [
              {
                question: 'What condition must hold for a functional dependency X -> A for a relation to be in Boyce-Codd Normal Form (BCNF)?',
                type: 'Multiple Choice',
                options: ['A must be a prime attribute', 'X must be a Superkey', 'X must be atomic', 'Relation must be in 4NF'],
                correctAnswer: 'X must be a Superkey',
                explanation: 'In BCNF, for every non-trivial functional dependency X -> A, X must be a superkey.',
                marks: 10,
                difficulty: 'Medium'
              },
              {
                question: 'Which SQL clause is executed FIRST during query evaluation?',
                type: 'Multiple Choice',
                options: ['SELECT', 'WHERE', 'FROM', 'HAVING'],
                correctAnswer: 'FROM',
                explanation: 'The SQL execution engine first evaluates FROM and JOIN clauses to form the working relational cross product.',
                marks: 10,
                difficulty: 'Easy'
              }
            ]
          }
        ]
      },
      {
        course: {
          title: 'Computer Networks & Protocol Engineering',
          code: 'CS-303',
          shortDescription: 'Understand OSI layers, TCP/IP, IPv4 VLSM subnetting, BGP/OSPF routing, and TLS security.',
          fullDescription: 'Degree-level computer networking course covering layered protocol stack architectures, Ethernet framing, CSMA/CD, IPv4/IPv6 VLSM subnetting, OSPF/BGP routing algorithms, TCP 3-way handshake, sliding window flow control, congestion control algorithms (Cubic/Reno), DNS, and TLS 1.3 cryptographic handshakes.',
          category: categoryMap['Cybersecurity & Network Systems'],
          level: 'Intermediate',
          duration: '14 Weeks',
          language: 'English',
          instructor: userMap['emily.watson@lms.com'],
          status: 'Published',
          tags: ['Networking', 'TCP/IP', 'Subnetting', 'Routing', 'Protocols', 'DNS'],
          learningOutcomes: [
            'Calculate IPv4 VLSM subnets and CIDR prefix aggregates',
            'Analyze packet encapsulation across OSI 7-layer hierarchy',
            'Trace TCP 3-way handshake, SYN cookies, and congestion control states',
            'Understand BGP path vector and OSPF link-state routing dynamics'
          ],
          prerequisites: ['Computer Organization & C Programming'],
          createdBy: adminId
        },
        sections: [
          {
            title: 'Module 1: Protocol Stacks & Physical/Data Link Layers',
            description: 'OSI 7-layer vs TCP/IP model, Ethernet frames, ARP, and MAC addressing.',
            lessons: [
              {
                title: 'Lesson 1.1: OSI & TCP/IP Layer Architecture',
                description: 'Encapsulation, decapsulation, headers, and protocol data units (PDU).',
                contentType: 'Text Note',
                duration: '25 mins',
                textNote: `# Layered Network Architecture

## OSI 7-Layer Model vs TCP/IP
1. **Application (Layer 7):** HTTP, DNS, SMTP, SSH (Data PDU)
2. **Presentation (Layer 6):** TLS, Data Encoding, Compression
3. **Session (Layer 5):** Sockets, RPC Sessions
4. **Transport (Layer 4):** TCP, UDP (Segment / Datagram PDU)
5. **Network (Layer 3):** IP, ICMP, BGP, OSPF (Packet PDU)
6. **Data Link (Layer 2):** Ethernet 802.3, Wi-Fi 802.11, ARP (Frame PDU)
7. **Physical (Layer 1):** Copper Bits, Fiber Optics (Bit Stream PDU)`
              }
            ]
          },
          {
            title: 'Module 2: Network Layer & IPv4 Subnetting Mechanics',
            description: 'Classless Inter-Domain Routing (CIDR), VLSM, and IP header fields.',
            lessons: [
              {
                title: 'Lesson 2.1: IPv4 Subnetting & VLSM Calculation Guide',
                description: 'Subnet masks, broadcast addresses, host range calculations.',
                contentType: 'PDF',
                duration: '35 mins',
                material: {
                  fileName: 'CN_IPv4_Subnetting_Cheatsheet.txt',
                  fileType: 'PDF',
                  relPath: 'pdfs/CN_IPv4_Subnetting_Cheatsheet.txt',
                  content: 'IPV4 SUBNETTING & VLSM CHEATSHEET\n\nGiven IP block: 192.168.10.0/24 (256 Total Addresses, 254 Usable Hosts).\nSubnet Mask: 255.255.255.0 (/24).\n\nTo divide into 4 equal subnets:\nBorrow 2 bits (2^2 = 4 subnets):\n- Subnet 1: 192.168.10.0/26 (Range: .1 to .62, Broadcast: .63)\n- Subnet 2: 192.168.10.64/26 (Range: .65 to .126, Broadcast: .127)\n- Subnet 3: 192.168.10.128/26 (Range: .129 to .190, Broadcast: .191)\n- Subnet 4: 192.168.10.192/26 (Range: .193 to .254, Broadcast: .255)'
                }
              }
            ]
          }
        ],
        assignments: [
          {
            title: 'Assignment 1: Enterprise IPv4 Subnetting Topology Blueprint',
            description: 'Design a corporate network topology utilizing VLSM for 5 distinct branch offices.',
            instructions: 'Given IP allocation 10.50.0.0/16, assign subnets to HQ (500 hosts), Engineering (200 hosts), Sales (100 hosts), Finance (50 hosts), and DMZ (20 hosts). Provide binary and decimal calculations for netmasks, broadcast addresses, and router interface IPs.',
            maxMarks: 100,
            deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
            allowedFileTypes: ['pdf', 'docx'],
            aiGradingPrompt: 'Check binary math accuracy for host bit allocation and verify non-overlapping subnet allocations.'
          }
        ],
        quizzes: [
          {
            title: 'Networking Protocols & Subnetting Knowledge Quiz',
            description: 'Assess subnetting calculations, TCP flags, and routing algorithms.',
            durationMinutes: 30,
            passingMarks: 60,
            questions: [
              {
                question: 'How many usable host IP addresses are available in a /27 IPv4 subnet?',
                type: 'Multiple Choice',
                options: ['32', '30', '64', '16'],
                correctAnswer: '30',
                explanation: 'A /27 subnet has 32 - 27 = 5 host bits. Total addresses = 2^5 = 32. Subtracting Network and Broadcast yields 30 usable host IPs.',
                marks: 10,
                difficulty: 'Medium'
              }
            ]
          }
        ]
      },
      {
        course: {
          title: 'Artificial Intelligence & Machine Learning Architecture',
          code: 'AI-501',
          shortDescription: 'Master regression, classification, decision trees, SVM, neural networks, and model evaluation.',
          fullDescription: 'Core university course introducing foundational algorithms in Machine Learning and Artificial Intelligence. Topics include Linear/Logistic Regression, Cost Function Optimization via Gradient Descent, Support Vector Machines (SVM), K-Means Clustering, Principal Component Analysis (PCA), and Feedforward Deep Neural Networks using Python and PyTorch.',
          category: categoryMap['Artificial Intelligence & Data Science'],
          level: 'Intermediate',
          duration: '12 Weeks',
          language: 'English',
          instructor: userMap['sarah.jenkins@lms.com'],
          status: 'Published',
          tags: ['AI', 'Machine Learning', 'Python', 'PyTorch', 'Neural Networks', 'Scikit-Learn'],
          learningOutcomes: [
            'Formulate supervised learning problems mathematically',
            'Derive and implement Gradient Descent optimization for cost function minimization',
            'Evaluate models using Confusion Matrix, Precision, Recall, and ROC-AUC',
            'Construct multilayer neural networks using PyTorch'
          ],
          prerequisites: ['Linear Algebra', 'Calculus', 'Python Programming'],
          createdBy: adminId
        },
        sections: [
          {
            title: 'Module 1: Supervised Learning: Regression & Optimization',
            description: 'Linear regression, mean squared error cost functions, and gradient descent.',
            lessons: [
              {
                title: 'Lesson 1.1: Linear Regression & Gradient Descent Mathematics',
                description: 'Cost function minimization and learning rate tuning.',
                contentType: 'Text Note',
                duration: '35 mins',
                textNote: `# Supervised Machine Learning: Linear Regression

## Mathematical Formulation
Hypothesis model: $h_\\theta(x) = \\theta_0 + \\theta_1 x_1 + \\dots + \\theta_n x_n = \\theta^T X$

## Cost Function (Mean Squared Error - MSE)
$$J(\\theta) = \\frac{1}{2m} \\sum_{i=1}^{m} \\left( h_\\theta(x^{(i)}) - y^{(i)} \\right)^2$$

## Gradient Descent Update Rule
Repeat until convergence:
$$\\theta_j := \\theta_j - \\alpha \\frac{\\partial}{\\partial \\theta_j} J(\\theta) = \\theta_j - \\alpha \\frac{1}{m} \\sum_{i=1}^{m} \\left( h_\\theta(x^{(i)}) - y^{(i)} \\right) x_j^{(i)}$$
where $\\alpha$ is the learning rate parameter.`,
                material: {
                  fileName: 'AI_ML_Linear_Regression_LectureNotes.txt',
                  fileType: 'Document',
                  relPath: 'documents/AI_ML_Linear_Regression_LectureNotes.txt',
                  content: 'AI DEGREE HANDOUT - SUPERVISED LEARNING\n\nGradient Descent Variations:\n1. Batch Gradient Descent: Computes gradient using all m training examples every epoch. Smooth convergence, computationally expensive for large datasets.\n2. Stochastic Gradient Descent (SGD): Updates parameters per individual example. Noisy trajectory, faster iteration.\n3. Mini-Batch Gradient Descent: Evaluates sub-batches of size b (e.g. 32, 64, 128).\n\nRegularization Methods:\n- L1 Regularization (Lasso): Adds lambda * sum(|theta|) -> forces sparse feature weights.\n- L2 Regularization (Ridge): Adds lambda * sum(theta^2) -> penalizes large weight values.'
                }
              }
            ]
          }
        ],
        assignments: [
          {
            title: 'Assignment 1: Housing Price Prediction with Ridge & Lasso Regression',
            description: 'Build end-to-end regression models using NumPy and Scikit-Learn.',
            instructions: 'Load the California Housing dataset. Perform feature scaling (StandardScaler), train Linear Regression, Ridge (L2), and Lasso (L1) models. Compare RMSE and R^2 scores on test set. Plot learning curves.',
            maxMarks: 100,
            deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            allowedFileTypes: ['ipynb', 'py', 'pdf'],
            aiGradingPrompt: 'Check feature scaling step before model fitting, test split isolation, and regression metric reporting.'
          }
        ],
        quizzes: [
          {
            title: 'Machine Learning Foundations Quiz',
            description: 'Test knowledge on cost functions, gradient descent, and regularization.',
            durationMinutes: 25,
            passingMarks: 60,
            questions: [
              {
                question: 'What is the main impact of setting the learning rate (alpha) too high during gradient descent?',
                type: 'Multiple Choice',
                options: [
                  'Gradient descent will converge extremely slowly',
                  'Gradient descent may overshoot the minimum and diverge',
                  'The model will immediately overfit the dataset',
                  'Parameters will remain constant'
                ],
                correctAnswer: 'Gradient descent may overshoot the minimum and diverge',
                explanation: 'An excessively large learning rate causes step updates to overshoot the local minimum of the cost function, causing divergence.',
                marks: 10,
                difficulty: 'Easy'
              }
            ]
          }
        ]
      },
      {
        course: {
          title: 'Software Engineering, System Design & Architecture',
          code: 'SE-401',
          shortDescription: 'Learn Agile software lifecycles, UML modeling, GoF design patterns, and microservices architecture.',
          fullDescription: 'Comprehensive degree course on modern software engineering. Covers Agile/Scrum, requirements specification, Unified Modeling Language (UML Class, Sequence, Use Case diagrams), Gang of Four design patterns (Singleton, Factory, Observer, Strategy, Adapter), Microservices architecture, RESTful API design, CI/CD, and automated software testing.',
          category: categoryMap['Software Engineering & Cloud Systems'],
          level: 'Advanced',
          duration: '12 Weeks',
          language: 'English',
          instructor: userMap['alan.turing@lms.com'],
          status: 'Published',
          tags: ['Software Engineering', 'UML', 'Design Patterns', 'Microservices', 'Agile'],
          learningOutcomes: [
            'Construct formal UML Class, Sequence, and Activity diagrams',
            'Apply Gang of Four design patterns to resolve architectural smells',
            'Design REST APIs adhering to Richardson Maturity Model Level 3',
            'Establish CI/CD build pipelines and automated testing'
          ],
          prerequisites: ['Object-Oriented Programming (Java/C++/Python)'],
          createdBy: adminId
        },
        sections: [
          {
            title: 'Module 1: Software Architecture & UML Modeling',
            description: 'UML class diagrams, relationships, and sequence diagrams.',
            lessons: [
              {
                title: 'Lesson 1.1: UML Class Diagrams & Object Relationships',
                description: 'Association, Aggregation, Composition, and Inheritance.',
                contentType: 'Text Note',
                duration: '30 mins',
                textNote: `# Object-Oriented UML Relationships

## Core Relationship Mechanics
1. **Inheritance (Is-A):** Solid line with closed hollow arrowhead.
2. **Realization (Implements):** Dashed line with closed hollow arrowhead.
3. **Composition (Has-A Strong):** Solid line with filled diamond arrowhead. Child object lifecycle bound to parent.
4. **Aggregation (Has-A Weak):** Solid line with hollow diamond arrowhead. Child object exists independently of parent.`
              }
            ]
          }
        ],
        assignments: [
          {
            title: 'Assignment 1: Hospital System UML Blueprint & Architecture',
            description: 'Model a complete healthcare application using UML Class and Sequence diagrams.',
            instructions: 'Create UML Class diagram containing Patient, Doctor, Appointment, ElectronicHealthRecord, and Billing modules. Show multiplicities and composition vs aggregation. Draw sequence diagram for appointment scheduling.',
            maxMarks: 100,
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            allowedFileTypes: ['pdf', 'png'],
            aiGradingPrompt: 'Verify correct UML arrow notation for composition vs aggregation and sequence diagram lifelines.'
          }
        ],
        quizzes: [
          {
            title: 'UML & Design Patterns Knowledge Check',
            description: 'Evaluate GoF design pattern selection and UML semantics.',
            durationMinutes: 20,
            passingMarks: 60,
            questions: [
              {
                question: 'Which Gang of Four (GoF) design pattern defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified automatically?',
                type: 'Multiple Choice',
                options: ['Factory Method', 'Observer Pattern', 'Singleton Pattern', 'Adapter Pattern'],
                correctAnswer: 'Observer Pattern',
                explanation: 'The Observer behavioral pattern notifies dependent observers of subject state changes.',
                marks: 10,
                difficulty: 'Medium'
              }
            ]
          }
        ]
      },
      {
        course: {
          title: 'Information Security & Network Defense',
          code: 'CY-401',
          shortDescription: 'Master AES/RSA cryptography, OWASP Top 10 vulnerabilities, PKI, and network defense.',
          fullDescription: 'Advanced degree course on cybersecurity principles. Covers information security principles (CIA Triad), symmetric ciphers (AES), public-key cryptography (RSA, Elliptic Curve), PKI, TLS handshakes, OWASP Top 10 web security (SQL Injection, XSS, CSRF), stateful firewalls, and penetration testing.',
          category: categoryMap['Cybersecurity & Network Systems'],
          level: 'Advanced',
          duration: '14 Weeks',
          language: 'English',
          instructor: userMap['emily.watson@lms.com'],
          status: 'Published',
          tags: ['Cybersecurity', 'Cryptography', 'AES', 'RSA', 'OWASP', 'Penetration Testing'],
          learningOutcomes: [
            'Implement cryptographic ciphers and key exchanges',
            'Analyze and patch OWASP Top 10 web application vulnerabilities',
            'Design public key infrastructures (PKI) and certificate chains',
            'Configure stateful inspection firewalls and intrusion prevention rules'
          ],
          prerequisites: ['Computer Networks'],
          createdBy: adminId
        },
        sections: [
          {
            title: 'Module 1: Cryptographic Primitives & Ciphers',
            description: 'Symmetric vs asymmetric ciphers, AES, RSA, and SHA hashing.',
            lessons: [
              {
                title: 'Lesson 1.1: Symmetric Ciphers & Public Key Cryptography',
                description: 'AES-256 block cipher modes and RSA mathematical foundation.',
                contentType: 'Text Note',
                duration: '35 mins',
                textNote: `# Cryptography Fundamentals

## Confidentiality, Integrity, Availability (CIA Triad)
- **Symmetric Encryption (AES-GCM, ChaCha20):** Same shared secret key used for encryption and decryption. Fast, ideal for bulk payload payload encryption.
- **Asymmetric Encryption (RSA, ECC):** Public Key encrypts / verifies signature; Private Key decrypts / signs.

## RSA Algorithm Key Generation
1. Select two large prime numbers $p$ and $q$.
2. Compute $n = p \\times q$ and Euler Totient $\\phi(n) = (p-1)(q-1)$.
3. Select integer $e$ coprime to $\\phi(n)$.
4. Compute private exponent $d \\equiv e^{-1} \\pmod{\\phi(n)}$.
5. Public Key = $(e, n)$, Private Key = $(d, n)$.`
              }
            ]
          }
        ],
        assignments: [
          {
            title: 'Assignment 1: Cryptographic Key Exchange & Cipher Lab',
            description: 'Implement RSA Key Generation and AES payload encryption in Python.',
            instructions: 'Write a Python program implementing RSA key generation from scratch using prime numbers. Use generated RSA key to securely exchange a symmetric AES-256 session key, then encrypt a secret message file.',
            maxMarks: 100,
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            allowedFileTypes: ['py', 'pdf', 'zip'],
            aiGradingPrompt: 'Check correctness of modular exponentiation in RSA math and AES initialization vector (IV) handling.'
          }
        ],
        quizzes: [
          {
            title: 'Cybersecurity & Cryptography Foundations Quiz',
            description: 'Check understanding of ciphers, hashing, and OWASP top vulnerabilities.',
            durationMinutes: 25,
            passingMarks: 60,
            questions: [
              {
                question: 'Which attack vectors fall under the OWASP Injection category?',
                type: 'Multiple Choice',
                options: ['SQL Injection (SQLi)', 'Command Injection', 'LDAP Injection', 'All of the above'],
                correctAnswer: 'All of the above',
                explanation: 'Injection attacks occur when untrusted data is sent to an interpreter as part of a command or query.',
                marks: 10,
                difficulty: 'Easy'
              }
            ]
          }
        ]
      },
      {
        course: {
          title: 'Data Science, Analytics & Big Data Pipeline',
          code: 'DS-301',
          shortDescription: 'Learn data cleaning, statistical hypothesis testing, interactive dashboards, and Apache Spark.',
          fullDescription: 'Degree course covering data science workflows. Includes data wrangling with Pandas/NumPy, exploratory data analysis (EDA), hypothesis testing (t-tests, ANOVA), data visualization with Plotly/Seaborn, and big data processing with Apache Spark RDDs and DataFrames.',
          category: categoryMap['Artificial Intelligence & Data Science'],
          level: 'Intermediate',
          duration: '10 Weeks',
          language: 'English',
          instructor: userMap['sarah.jenkins@lms.com'],
          status: 'Published',
          tags: ['Data Science', 'Pandas', 'Spark', 'Big Data', 'Statistics', 'EDA'],
          learningOutcomes: [
            'Clean dirty real-world datasets using Pandas and NumPy',
            'Conduct statistical hypothesis testing and interpret p-values',
            'Build analytical data visualizations and dashboards',
            'Run PySpark distributed MapReduce pipelines'
          ],
          prerequisites: ['Python Programming', 'Probability & Statistics'],
          createdBy: adminId
        },
        sections: [
          {
            title: 'Module 1: Exploratory Data Analysis & Statistical Inference',
            description: 'Pandas data structures, missing data imputation, and hypothesis testing.',
            lessons: [
              {
                title: 'Lesson 1.1: Pandas EDA & Statistical Hypothesis Testing',
                description: 'T-tests, ANOVA, p-values, and confidence intervals.',
                contentType: 'Text Note',
                duration: '30 mins',
                textNote: `# Data Science & Statistical Inference

## Exploratory Data Analysis (EDA) Steps
1. Data Inspection & Schema Profiling (\`df.info()\`, \`df.describe()\`).
2. Missing Value Imputation (Mean/Median for Skewed Distributions).
3. Outlier Detection using Interquartile Range ($IQR = Q3 - Q1$).

## Hypothesis Testing Framework
- **Null Hypothesis ($H_0$):** No difference or effect exists.
- **Alternative Hypothesis ($H_1$):** Significant effect exists.
- **P-Value:** Probability of obtaining test results at least as extreme as observed, assuming $H_0$ is true. If $p < 0.05$, reject $H_0$.`
              }
            ]
          }
        ],
        assignments: [
          {
            title: 'Assignment 1: Global Healthcare EDA & Feature Engineering Notebook',
            description: 'Perform complete exploratory analysis and hypothesis testing on a healthcare dataset.',
            instructions: 'Analyze patient admission dataset in Jupyter Notebook. Handle missing values, compute correlation heatmaps, run two-sample t-test comparing treatment recovery times, and export clean features.',
            maxMarks: 100,
            deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            allowedFileTypes: ['ipynb', 'pdf'],
            aiGradingPrompt: 'Grade EDA statistical interpretation, p-value analysis, and data cleaning quality.'
          }
        ],
        quizzes: [
          {
            title: 'Data Science & Statistics Assessment',
            description: 'Test probability distributions, EDA methods, and hypothesis testing.',
            durationMinutes: 20,
            passingMarks: 60,
            questions: [
              {
                question: 'If a two-sample t-test yields a p-value of 0.02 at a significance level alpha = 0.05, what conclusion should be drawn?',
                type: 'Multiple Choice',
                options: [
                  'Reject the Null Hypothesis (H0) as the result is statistically significant',
                  'Fail to reject the Null Hypothesis (H0)',
                  'Accept the Null Hypothesis (H0) as true',
                  'Increase sample size and recalculate'
                ],
                correctAnswer: 'Reject the Null Hypothesis (H0) as the result is statistically significant',
                explanation: 'Since p-value (0.02) < alpha (0.05), we reject H0 in favor of the alternative hypothesis.',
                marks: 10,
                difficulty: 'Medium'
              }
            ]
          }
        ]
      },
      {
        course: {
          title: 'Digital Logic Design & Computer Organization',
          code: 'EC-201',
          shortDescription: 'Master Boolean logic, Karnaugh maps, logic gates, sequential flip-flops, and RISC-V CPU ISA.',
          fullDescription: 'Foundational degree course in hardware engineering and computer organization. Topics include binary arithmetic, Boolean logic simplification, Karnaugh Maps (K-Maps), multiplexers, adders, sequential logic (D/JK Flip-Flops), RISC-V 32-bit instruction set architecture (ISA), and 5-stage CPU pipelining.',
          category: categoryMap['Computer Hardware & Digital Systems'],
          level: 'Beginner',
          duration: '14 Weeks',
          language: 'English',
          instructor: userMap['robert.chen@lms.com'],
          status: 'Published',
          tags: ['Digital Logic', 'Boolean Algebra', 'K-Maps', 'RISC-V', 'CPU Architecture'],
          learningOutcomes: [
            'Simplify Boolean algebraic expressions using K-Maps',
            'Synthesize combinational logic circuits (adders, multiplexers)',
            'Design sequential finite state machines using flip-flops',
            'Write RISC-V assembly programs and resolve pipeline hazards'
          ],
          prerequisites: ['Introduction to Programming'],
          createdBy: adminId
        },
        sections: [
          {
            title: 'Module 1: Logic Gates & Boolean Algebra Simplification',
            description: 'Truth tables, De Morgan laws, and Karnaugh maps.',
            lessons: [
              {
                title: 'Lesson 1.1: Boolean Logic & K-Map Minimization',
                description: 'Simplifying sum-of-products (SOP) expressions.',
                contentType: 'Text Note',
                duration: '30 mins',
                textNote: `# Digital Logic & Boolean Simplification

## De Morgan's Laws
1. $\\overline{A \\cdot B} = \\overline{A} + \\overline{B}$
2. $\\overline{A + B} = \\overline{A} \\cdot \\overline{B}$

## Karnaugh Map (K-Map) Rules
K-Maps visualize truth tables on a grid formatted in Gray Code (00, 01, 11, 10).
- Group 1s in powers of two ($1, 2, 4, 8, 16$).
- Larger groups yield simpler Boolean terms (fewer variables per prime implicant).`
              }
            ]
          }
        ],
        assignments: [
          {
            title: 'Assignment 1: 4-Bit Arithmetic Logic Unit (ALU) Circuit Design',
            description: 'Design and simulate a 4-bit ALU performing ADD, SUB, AND, OR functions.',
            instructions: 'Using Logisim or digital schematic editor, design a 4-bit ALU using 4-to-1 Multiplexers and Full Adders. Provide complete truth tables, Boolean expressions, and schematic diagrams.',
            maxMarks: 100,
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            allowedFileTypes: ['pdf', 'circ', 'png'],
            aiGradingPrompt: 'Verify 4-bit ALU multiplexer select logic and full adder carry propagation.'
          }
        ],
        quizzes: [
          {
            title: 'Digital Logic Gates & K-Map Quiz',
            description: 'Test Boolean algebra rules, De Morgan laws, and logic gates.',
            durationMinutes: 20,
            passingMarks: 60,
            questions: [
              {
                question: 'According to De Morgan\'s Law, what is the equivalent expression for NOT (A AND B)?',
                type: 'Multiple Choice',
                options: ['(NOT A) OR (NOT B)', '(NOT A) AND (NOT B)', 'NOT (A OR B)', 'A XOR B'],
                correctAnswer: '(NOT A) OR (NOT B)',
                explanation: 'De Morgan\'s law states that the complement of a product equals the sum of the individual complements.',
                marks: 10,
                difficulty: 'Easy'
              }
            ]
          }
        ]
      }
    ];

    // Clean up all existing courses to ensure no slug/code conflicts
    console.log('[Seed] Cleaning existing course relations for fresh data injection...');
    const targetCodes = coursesDefinition.map(c => c.course.code);
    const targetSlugs = coursesDefinition.map(c => 
      c.course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    );
    
    // Find any course matching target codes or target slugs, or older seed codes
    const existingCourses = await Course.find({
      $or: [
        { code: { $in: [...targetCodes, 'CS-AI101', 'CS-WEB201', 'CS-DS301'] } },
        { slug: { $in: targetSlugs } }
      ]
    });
    const existingCourseIds = existingCourses.map(c => c._id);

    if (existingCourseIds.length > 0) {
      await CourseSection.deleteMany({ courseId: { $in: existingCourseIds } });
      await Lesson.deleteMany({ courseId: { $in: existingCourseIds } });
      await LearningMaterial.deleteMany({ courseId: { $in: existingCourseIds } });
      await KnowledgeDocument.deleteMany({ courseId: { $in: existingCourseIds } });
      await Assignment.deleteMany({ courseId: { $in: existingCourseIds } });
      await Quiz.deleteMany({ courseId: { $in: existingCourseIds } });
      await Question.deleteMany({ courseId: { $in: existingCourseIds } });
      await Enrollment.deleteMany({ course: { $in: existingCourseIds } });
      await Submission.deleteMany({ courseId: { $in: existingCourseIds } });
      await QuizAttempt.deleteMany({ courseId: { $in: existingCourseIds } });
      await StudyPlan.deleteMany({ courseId: { $in: existingCourseIds } });
      await LearningRecommendation.deleteMany({ courseId: { $in: existingCourseIds } });
      await Course.deleteMany({ _id: { $in: existingCourseIds } });
    }

    // Process Courses Creation & Seeding
    const createdCourses = [];
    for (const item of coursesDefinition) {
      const course = await Course.create(item.course);
      createdCourses.push(course);
      console.log(`[Seed] Course set up: ${course.code} - ${course.title}`);

      // Seed Sections & Lessons
      let sectionOrder = 1;
      for (const secDef of item.sections) {
        const section = await CourseSection.create({
          courseId: course._id,
          title: secDef.title,
          description: secDef.description,
          order: sectionOrder++
        });

        let lessonOrder = 1;
        for (const lesDef of secDef.lessons) {
          const lesson = await Lesson.create({
            courseId: course._id,
            sectionId: section._id,
            title: lesDef.title,
            description: lesDef.description,
            duration: lesDef.duration || '25 mins',
            contentType: lesDef.contentType,
            order: lessonOrder++,
            textNote: lesDef.textNote || '',
            summary: lesDef.description
          });

          // Seed LearningMaterial if defined
          if (lesDef.material) {
            const matDef = lesDef.material;
            const fileUrlPath = createMaterialFile(matDef.relPath, matDef.content);

            const material = await LearningMaterial.create({
              lessonId: lesson._id,
              courseId: course._id,
              fileName: matDef.fileName,
              fileType: matDef.fileType,
              fileUrl: fileUrlPath,
              fileSize: Buffer.byteLength(matDef.content, 'utf8'),
              mimeType: matDef.fileType === 'PDF' ? 'application/pdf' : 'text/plain',
              uploadedBy: course.instructor,
              extractedText: matDef.content
            });

            // Create corresponding KnowledgeDocument for RAG / AI Tutor search
            await KnowledgeDocument.create({
              courseId: course._id,
              lessonId: lesson._id,
              materialId: material._id,
              fileName: material.fileName,
              fileType: material.fileType,
              sourceUrl: material.fileUrl,
              processingStatus: 'COMPLETED',
              embeddingStatus: 'COMPLETED',
              chunkCount: 6,
              createdBy: course.instructor
            });
          }
        }
      }

      // Seed Assignments
      if (item.assignments) {
        for (const assDef of item.assignments) {
          await Assignment.create({
            courseId: course._id,
            title: assDef.title,
            description: assDef.description,
            instructions: assDef.instructions,
            maxMarks: assDef.maxMarks,
            deadline: assDef.deadline,
            allowedFileTypes: assDef.allowedFileTypes,
            status: 'Published',
            createdBy: course.instructor,
            aiGradingPrompt: assDef.aiGradingPrompt
          });
        }
      }

      // Seed Quizzes & Questions
      if (item.quizzes) {
        for (const qzDef of item.quizzes) {
          const quiz = await Quiz.create({
            courseId: course._id,
            title: qzDef.title,
            description: qzDef.description,
            durationMinutes: qzDef.durationMinutes,
            passingMarks: qzDef.passingMarks,
            status: 'Published',
            createdBy: course.instructor
          });

          let qOrder = 1;
          for (const qItem of qzDef.questions) {
            await Question.create({
              quizId: quiz._id,
              courseId: course._id,
              question: qItem.question,
              type: qItem.type,
              options: qItem.options,
              correctAnswer: qItem.correctAnswer,
              explanation: qItem.explanation,
              marks: qItem.marks,
              order: qOrder++,
              status: 'Approved',
              difficulty: qItem.difficulty || 'Medium'
            });
          }
        }
      }
    }

    // 4. Seed Student Enrollments & Submissions for Alex Johnson
    console.log('[Seed] Seeding enrollments & progress for Alex Johnson (student@lms.com)...');
    const studentCoursesProgress = [
      { code: 'CS-301', progress: 65 },
      { code: 'CS-202', progress: 80 },
      { code: 'CS-303', progress: 40 },
      { code: 'AI-501', progress: 25 },
      { code: 'SE-401', progress: 50 }
    ];

    for (const item of studentCoursesProgress) {
      const course = createdCourses.find(c => c.code === item.code);
      if (course) {
        await Enrollment.create({
          student: mainStudentId,
          course: course._id,
          status: 'Active',
          progress: item.progress,
          enrollmentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        });
        await Course.findByIdAndUpdate(course._id, { $inc: { enrolledCount: 1 } });

        // Create sample graded assignment submission
        const assignment = await Assignment.findOne({ courseId: course._id });
        if (assignment) {
          await Submission.create({
            assignmentId: assignment._id,
            courseId: course._id,
            studentId: mainStudentId,
            fileUrl: '/uploads/documents/Sample_Student_Submission.txt',
            fileName: `${course.code}_Assignment1_Submission.txt`,
            fileSize: 1240,
            submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            status: 'Graded',
            marks: 92,
            feedback: 'Excellent implementation of algorithms and clear documentation!',
            gradedBy: course.instructor,
            gradedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          });
        }

        // Create sample quiz attempt
        const quiz = await Quiz.findOne({ courseId: course._id });
        if (quiz) {
          const questions = await Question.find({ quizId: quiz._id });
          await QuizAttempt.create({
            quizId: quiz._id,
            courseId: course._id,
            studentId: mainStudentId,
            score: 40,
            maxScore: 50,
            percentage: 80,
            passed: true,
            status: 'Completed',
            attemptNumber: 1,
            submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            answers: questions.map(q => ({
              questionId: q._id,
              studentAnswer: q.correctAnswer,
              isCorrect: true,
              marksAwarded: q.marks
            }))
          });
        }
      }
    }

    // 5. Seed Student Study Plan & Tasks
    console.log('[Seed] Seeding personalized study plan for Alex Johnson...');
    const osCourse = createdCourses.find(c => c.code === 'CS-301');
    if (osCourse) {
      const studyPlan = await StudyPlan.create({
        studentId: mainStudentId,
        courseId: osCourse._id,
        title: 'B.Tech CS Final Exam Study Plan: Operating Systems & Kernel Architecture',
        examDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        availableHoursPerDay: 3,
        preferredStudyTime: 'Evening',
        learningGoal: 'Achieve Grade A in OS Mid-Term and Master Virtual Memory Paging',
        status: 'Active'
      });

      const today = new Date();
      const planTasks = [
        {
          title: 'Review Monolithic vs Microkernel Architecture Handout',
          description: 'Read Chapter 1 lecture notes on Ring 0 execution and POSIX system call traps.',
          topic: 'Operating System Architecture',
          resourceType: 'Lesson',
          durationMinutes: 45,
          priority: 'High',
          status: 'Completed',
          offsetDays: -1
        },
        {
          title: 'Solve CPU Scheduling Gantt Chart Math Exercises',
          description: 'Practice calculating Turnaround Time and Waiting Time for Round-Robin quantum=4ms.',
          topic: 'CPU Scheduling',
          resourceType: 'Revision',
          durationMinutes: 60,
          priority: 'High',
          status: 'Pending',
          offsetDays: 0
        },
        {
          title: 'Complete OS Mid-Term Practice Quiz',
          description: 'Take the online diagnostic quiz on process synchronization and semaphores.',
          topic: 'Concurrency Control',
          resourceType: 'Quiz',
          durationMinutes: 30,
          priority: 'Medium',
          status: 'Pending',
          offsetDays: 1
        },
        {
          title: 'Study Demand Paging & Page Replacement Algorithms',
          description: 'Review LRU, FIFO, and Optimal page replacement trace examples.',
          topic: 'Virtual Memory',
          resourceType: 'Lesson',
          durationMinutes: 50,
          priority: 'High',
          status: 'Pending',
          offsetDays: 2
        },
        {
          title: 'Work on C Multithreaded Process Scheduler Assignment',
          description: 'Implement pthread locks and state transition queue logic.',
          topic: 'C Systems Programming',
          resourceType: 'Assignment',
          durationMinutes: 90,
          priority: 'High',
          status: 'Pending',
          offsetDays: 3
        }
      ];

      for (let i = 0; i < planTasks.length; i++) {
        const t = planTasks[i];
        const taskDate = new Date(today);
        taskDate.setDate(today.getDate() + t.offsetDays);
        await StudyPlanTask.create({
          studyPlanId: studyPlan._id,
          date: taskDate,
          title: t.title,
          description: t.description,
          topic: t.topic,
          resourceType: t.resourceType,
          durationMinutes: t.durationMinutes,
          priority: t.priority,
          status: t.status,
          order: i + 1
        });
      }
    }

    // 6. Seed Learning Profile & Recommendations
    console.log('[Seed] Seeding student learning profile & recommendations...');
    await LearningProfile.findOneAndUpdate(
      { studentId: mainStudentId },
      {
        studentId: mainStudentId,
        learningPreferences: ['Visual Diagrams', 'Interactive Practice Quizzes', 'Hands-on Code Labs'],
        preferredStudyTime: 'Evening',
        availableStudyHours: 3,
        learningGoal: 'Master Degree Level Computer Science Core Subjects',
        strongTopics: [
          { topic: 'Relational Database SQL Joins', courseId: createdCourses.find(c => c.code === 'CS-202')?._id, scorePercentage: 92 },
          { topic: 'CPU Process Control Blocks (PCB)', courseId: osCourse?._id, scorePercentage: 88 }
        ],
        weakTopics: [
          { topic: 'Virtual Memory Page Replacement (LRU & FIFO)', courseId: osCourse?._id, weakScore: 45, reason: 'Low score on practice quiz', status: 'Weak' },
          { topic: 'IPv4 VLSM Subnetting Math', courseId: createdCourses.find(c => c.code === 'CS-303')?._id, weakScore: 52, reason: 'Needs extra problem solving practice', status: 'Needs Improvement' }
        ],
        lastAnalyzedAt: new Date()
      },
      { upsert: true }
    );

    if (osCourse) {
      await LearningRecommendation.create({
        studentId: mainStudentId,
        courseId: osCourse._id,
        type: 'Lesson',
        topic: 'Virtual Memory & Page Replacement',
        reason: 'Recommended based on identified weak performance in Virtual Memory Paging practice.',
        priority: 'High',
        status: 'Active',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    }

    console.log('\n=============================================================');
    console.log('[Seed Complete] Real-World Degree Courses & Test Data Injected Successfully!');
    console.log(`- Courses Created: ${createdCourses.length} (CS-301, CS-202, CS-303, AI-501, SE-401, CY-401, DS-301, EC-201)`);
    console.log(`- Faculty Accounts: sarah.jenkins@lms.com, robert.chen@lms.com, alan.turing@lms.com, emily.watson@lms.com`);
    console.log(`- Main Student Account: student@lms.com / StudentPassword123!`);
    console.log('=============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Database seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
