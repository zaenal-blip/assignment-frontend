import type { User, Project, Event, Task, Activity, RegularActivity, PersonalJob } from "@/types";

export const users: User[] = [
    { id: "u1", name: "Ahmad Fauzi", email: "ahmad@tps.co.id", phone: "+62 812-3456-7890", role: "Admin", avatar: "AF", status: "Active" },
    { id: "u2", name: "Budi Santoso", email: "budi@tps.co.id", phone: "+62 813-4567-8901", role: "Leader", avatar: "BS", status: "Active" },
    { id: "u3", name: "Citra Dewi", email: "citra@tps.co.id", phone: "+62 814-5678-9012", role: "SPV", avatar: "CD", status: "Active" },
    { id: "u4", name: "Dedi Kurniawan", email: "dedi@tps.co.id", phone: "+62 815-6789-0123", role: "DPH", avatar: "DK", status: "Active" },
    { id: "u5", name: "Eka Prasetya", email: "eka@tps.co.id", phone: "+62 816-7890-1234", role: "Member", avatar: "EP", status: "Active" },
    { id: "u6", name: "Fitri Handayani", email: "fitri@tps.co.id", phone: "+62 817-8901-2345", role: "Member", avatar: "FH", status: "Active" },
    { id: "u7", name: "Gunawan Wibowo", email: "gunawan@tps.co.id", phone: "+62 818-9012-3456", role: "Member", avatar: "GW", status: "Inactive" },
    { id: "u8", name: "Hana Sari", email: "hana@tps.co.id", phone: "+62 819-0123-4567", role: "SPV", avatar: "HS", status: "Active" },
    { id: "u9", name: "Irfan Maulana", email: "irfan@tps.co.id", phone: "+62 820-1234-5678", role: "Member", avatar: "IM", status: "Active" },
];

export const currentUser = users[4]; // Eka Prasetya, Member

export const projects: Project[] = [
    { id: "p1", name: "Engine Block Assembly Line", ownerId: "u2", description: "Complete engine block assembly line optimization project", status: "Active", startDate: "2026-01-15", endDate: "2026-03-15", createdAt: "2026-01-15" },
    { id: "p2", name: "Cylinder Head Quality Control", ownerId: "u3", description: "Cylinder head QC process improvement", status: "Active", startDate: "2026-02-01", endDate: "2026-03-20", createdAt: "2026-02-01" },
    { id: "p3", name: "Transmission Housing Upgrade", ownerId: "u2", description: "Transmission housing production line upgrade", status: "On Hold", startDate: "2026-01-20", endDate: "2026-04-10", createdAt: "2026-01-20" },
    { id: "p4", name: "Painting Line Automation", ownerId: "u8", description: "Automated painting line installation", status: "Active", startDate: "2026-02-10", endDate: "2026-03-25", createdAt: "2026-02-10" },
    { id: "p5", name: "Final Inspection System", ownerId: "u3", description: "Digital final inspection system implementation", status: "Completed", startDate: "2025-11-01", endDate: "2026-02-28", createdAt: "2025-11-01" },
];

const today = new Date();
const y = today.getFullYear();
const m = today.getMonth();

function d(day: number, monthOffset = 0): string {
    return new Date(y, m + monthOffset, day).toISOString().split("T")[0];
}

export const events: Event[] = [
    { id: "e1", name: "Line Balancing Review", projectId: "p1", picId: "u3", date: d(3), description: "Review line balancing for engine block", status: "Completed" },
    { id: "e2", name: "Tool Calibration", projectId: "p1", picId: "u4", date: d(7), description: "Calibrate all assembly tools", status: "In Progress" },
    { id: "e3", name: "Material Prep", projectId: "p1", picId: "u5", date: d(12), description: "Prepare raw materials for assembly", status: "Planned" },
    { id: "e4", name: "QC Audit Phase 1", projectId: "p2", picId: "u3", date: d(5), description: "First phase quality control audit", status: "Completed" },
    { id: "e5", name: "Measurement System", projectId: "p2", picId: "u6", date: d(10), description: "Setup measurement system analysis", status: "In Progress" },
    { id: "e6", name: "Defect Mapping", projectId: "p2", picId: "u5", date: d(18), description: "Map common defect patterns", status: "Planned" },
    { id: "e7", name: "Housing Design Review", projectId: "p3", picId: "u4", date: d(8), description: "Review transmission housing design changes", status: "Planned" },
    { id: "e8", name: "Robot Programming", projectId: "p4", picId: "u8", date: d(15), description: "Program painting robots", status: "In Progress" },
    { id: "e9", name: "Paint Booth Setup", projectId: "p4", picId: "u9", date: d(20), description: "Setup new paint booth", status: "Planned" },
    { id: "e10", name: "System Testing", projectId: "p5", picId: "u3", date: d(2), description: "Final system testing", status: "Completed" },
    { id: "e11", name: "Safety Inspection", projectId: "p1", picId: "u8", date: d(25), description: "Monthly safety inspection", status: "Planned" },
    { id: "e12", name: "Training Session", projectId: "p4", picId: "u2", date: d(22), description: "Operator training for new paint line", status: "Planned" },
    { id: "e13", name: "QC Audit Phase 2", projectId: "p2", picId: "u3", date: d(28), description: "Second phase quality control audit", status: "Planned" },
];

export const tasks: Task[] = [
    // e1 tasks
    {
        id: "t1", name: "Collect Cycle Time Data", eventId: "e1", picId: "u5", dueDate: d(3), status: "Completed",
        checklist: [
            { id: "c1", label: "Setup timer stations", completed: true },
            { id: "c2", label: "Record 50 cycles", completed: true },
            { id: "c3", label: "Compile data spreadsheet", completed: true },
        ],
    },
    {
        id: "t2", name: "Analyze Bottlenecks", eventId: "e1", picId: "u6", dueDate: d(4), status: "Completed",
        checklist: [
            { id: "c4", label: "Identify slow stations", completed: true },
            { id: "c5", label: "Root cause analysis", completed: true },
            { id: "c6", label: "Prepare report", completed: true },
        ],
    },
    // e2 tasks
    {
        id: "t3", name: "Torque Wrench Calibration", eventId: "e2", picId: "u5", dueDate: d(8), status: "In Progress",
        checklist: [
            { id: "c7", label: "Prepare calibration tools", completed: true },
            { id: "c8", label: "Calibrate 20Nm wrenches", completed: true },
            { id: "c9", label: "Calibrate 50Nm wrenches", completed: false },
            { id: "c10", label: "Update calibration log", completed: false },
        ],
    },
    {
        id: "t4", name: "Gauge Block Verification", eventId: "e2", picId: "u9", dueDate: d(9), status: "Not Started",
        checklist: [
            { id: "c11", label: "Clean gauge blocks", completed: false },
            { id: "c12", label: "Verify Grade 1 blocks", completed: false },
            { id: "c13", label: "Document results", completed: false },
        ],
    },
    // e4 tasks
    {
        id: "t5", name: "Prepare Audit Checklist", eventId: "e4", picId: "u6", dueDate: d(5), status: "Completed",
        checklist: [
            { id: "c14", label: "Review ISO standards", completed: true },
            { id: "c15", label: "Draft checklist", completed: true },
            { id: "c16", label: "Get approval from SPV", completed: true },
        ],
    },
    // e5 tasks
    {
        id: "t6", name: "Setup CMM Machine", eventId: "e5", picId: "u5", dueDate: d(11), status: "In Progress",
        checklist: [
            { id: "c17", label: "Install measurement probe", completed: true },
            { id: "c18", label: "Run test program", completed: false },
            { id: "c19", label: "Validate accuracy", completed: false },
        ],
    },
    // e6 tasks
    {
        id: "t7", name: "Collect Defect Samples", eventId: "e6", picId: "u5", dueDate: d(19), status: "Not Started",
        checklist: [
            { id: "c20", label: "Gather samples from Line A", completed: false },
            { id: "c21", label: "Gather samples from Line B", completed: false },
            { id: "c22", label: "Photograph defects", completed: false },
            { id: "c23", label: "Log in defect database", completed: false },
        ],
    },
    // e8 tasks
    {
        id: "t8", name: "Program Spray Pattern", eventId: "e8", picId: "u9", dueDate: d(16), status: "In Progress",
        checklist: [
            { id: "c24", label: "Define spray coordinates", completed: true },
            { id: "c25", label: "Test pattern on sample", completed: false },
            { id: "c26", label: "Optimize speed settings", completed: false },
        ],
    },
    // e9 tasks
    {
        id: "t9", name: "Install Ventilation", eventId: "e9", picId: "u5", dueDate: d(21), status: "Not Started",
        checklist: [
            { id: "c27", label: "Check ductwork layout", completed: false },
            { id: "c28", label: "Install exhaust fans", completed: false },
            { id: "c29", label: "Test airflow", completed: false },
        ],
    },
    // e10 tasks
    {
        id: "t10", name: "Run Integration Tests", eventId: "e10", picId: "u6", dueDate: d(2), status: "Completed",
        checklist: [
            { id: "c30", label: "Test scanner module", completed: true },
            { id: "c31", label: "Test reporting module", completed: true },
            { id: "c32", label: "End-to-end verification", completed: true },
        ],
    },
];

export const activities: Activity[] = [
    { id: "a1", message: "completed all checklist items for 'Collect Cycle Time Data'", timestamp: d(3) + "T14:30:00", userId: "u5", type: "checklist" },
    { id: "a2", message: "created event 'Paint Booth Setup'", timestamp: d(2) + "T10:00:00", userId: "u8", type: "event" },
    { id: "a3", message: "updated progress on 'Torque Wrench Calibration'", timestamp: d(1) + "T16:45:00", userId: "u5", type: "task" },
    { id: "a4", message: "completed 'QC Audit Phase 1'", timestamp: d(1) + "T09:15:00", userId: "u3", type: "event" },
    { id: "a5", message: "created project 'Painting Line Automation'", timestamp: d(-5) + "T08:00:00", userId: "u8", type: "project" },
    { id: "a6", message: "marked 'System Testing' as completed", timestamp: d(2) + "T17:00:00", userId: "u3", type: "event" },
    { id: "a7", message: "updated checklist for 'Setup CMM Machine'", timestamp: d(0) + "T11:30:00", userId: "u5", type: "checklist" },
    { id: "a8", message: "assigned 'Program Spray Pattern' to Irfan", timestamp: d(-1) + "T13:00:00", userId: "u8", type: "task" },
];

export function getUserById(id: string): User | undefined {
    return users.find((u) => u.id === id);
}

export function getProjectEvents(projectId: string): Event[] {
    return events.filter((e) => e.projectId === projectId);
}

export function getEventTasks(eventId: string): Task[] {
    return tasks.filter((t) => t.eventId === eventId);
}

export function getUserTasks(userId: string): Task[] {
    return tasks.filter((t) => t.picId === userId);
}

export const regularActivities: RegularActivity[] = [
    {
        id: "ra1", name: "Daily Safety Patrol", category: "Safety", frequency: "Daily", picId: "u1", date: d(0), startTime: "08:00", endTime: "09:00", lastUpdate: d(0), status: "Completed", priority: "Low",
        checklist: [
            { id: "rc1", label: "Check emergency exit", completed: true },
            { id: "rc2", label: "Check fire extinguisher", completed: true },
            { id: "rc3", label: "Check safety sign", completed: true },
            { id: "rc4", label: "Check floor condition", completed: true },
        ],
    },
    {
        id: "ra2", name: "Machine Inspection", category: "Cost", frequency: "Daily", picId: "u3", date: d(0), startTime: "08:30", endTime: "09:30", lastUpdate: d(-1), status: "Pending", priority: "High",
        checklist: [
            { id: "rc5", label: "Check oil level", completed: true },
            { id: "rc6", label: "Check belt tension", completed: false },
            { id: "rc7", label: "Check temperature gauge", completed: false },
            { id: "rc8", label: "Log machine hours", completed: false },
        ],
    },
    {
        id: "ra3", name: "4S Audit", category: "Productivity", frequency: "Weekly", picId: "u4", date: d(1), startTime: "10:00", endTime: "11:30", lastUpdate: d(-3), status: "Overdue", priority: "Medium",
        checklist: [
            { id: "rc9", label: "Sort unnecessary items", completed: false },
            { id: "rc10", label: "Set workplace in order", completed: false },
            { id: "rc11", label: "Shine work area", completed: false },
            { id: "rc12", label: "Standardize procedures", completed: false },
        ],
    },
    {
        id: "ra4", name: "Quality Patrol", category: "Quality", frequency: "Daily", picId: "u5", date: d(0), startTime: "09:00", endTime: "10:00", lastUpdate: d(0), status: "Pending", priority: "Medium",
        checklist: [
            { id: "rc13", label: "Check product dimensions", completed: true },
            { id: "rc14", label: "Visual defect inspection", completed: true },
            { id: "rc15", label: "Record measurement data", completed: false },
            { id: "rc16", label: "Submit quality report", completed: false },
        ],
    },
    {
        id: "ra5", name: "Environmental Check", category: "HR", frequency: "Weekly", picId: "u8", date: d(2), startTime: "13:00", endTime: "14:00", lastUpdate: d(-2), status: "Completed", priority: "Low",
        checklist: [
            { id: "rc17", label: "Check waste disposal", completed: true },
            { id: "rc18", label: "Check chemical storage", completed: true },
            { id: "rc19", label: "Check ventilation system", completed: true },
        ],
    },
    {
        id: "ra6", name: "Safety Equipment Check", category: "Safety", frequency: "Monthly", picId: "u2", date: d(3), startTime: "08:00", endTime: "09:30", lastUpdate: d(-10), status: "Overdue", priority: "High",
        checklist: [
            { id: "rc20", label: "Inspect PPE condition", completed: false },
            { id: "rc21", label: "Check first aid kit", completed: false },
            { id: "rc22", label: "Test emergency alarm", completed: false },
            { id: "rc23", label: "Review safety manual", completed: false },
        ],
    },
    {
        id: "ra7", name: "Production Line Audit", category: "Quality", frequency: "Monthly", picId: "u3", date: d(1), startTime: "14:00", endTime: "15:30", lastUpdate: d(-5), status: "Pending", priority: "Medium",
        checklist: [
            { id: "rc24", label: "Verify SOP compliance", completed: true },
            { id: "rc25", label: "Check calibration records", completed: false },
            { id: "rc26", label: "Review reject rate data", completed: false },
        ],
    },
];

export function getRegularActivityById(id: string): RegularActivity | undefined {
    return regularActivities.find((a) => a.id === id);
}

export const personalJobs: PersonalJob[] = [
    {
        id: "pj1", name: "Daily Machine Check", description: "Routine daily check of assigned machines", source: "Personal", picId: "u5", dueDate: d(12), priority: "Medium", status: "In Progress",
        checklist: [
            { id: "pjc1", label: "Prepare tools", completed: true },
            { id: "pjc2", label: "Check machine oil", completed: true },
            { id: "pjc3", label: "Record inspection result", completed: false },
            { id: "pjc4", label: "Submit report", completed: false },
        ],
    },
    {
        id: "pj2", name: "Weekly Data Collection", description: "Collect production data for weekly report", source: "Personal", picId: "u5", dueDate: d(14), priority: "High", status: "Not Started",
        checklist: [
            { id: "pjc5", label: "Collect data from Line A", completed: false },
            { id: "pjc6", label: "Collect data from Line B", completed: false },
            { id: "pjc7", label: "Compile spreadsheet", completed: false },
            { id: "pjc8", label: "Submit to supervisor", completed: false },
        ],
    },
    {
        id: "pj3", name: "Tool Inventory Update", description: "Update tool inventory list for the section", source: "Personal", picId: "u5", dueDate: d(10), priority: "Low", status: "Completed",
        checklist: [
            { id: "pjc9", label: "Count all tools", completed: true },
            { id: "pjc10", label: "Check tool conditions", completed: true },
            { id: "pjc11", label: "Update inventory sheet", completed: true },
        ],
    },
];

export function getUserPersonalJobs(userId: string): PersonalJob[] {
    return personalJobs.filter((j) => j.picId === userId);
}

export function getPersonalJobById(id: string): PersonalJob | undefined {
    return personalJobs.find((j) => j.id === id);
}

export function getUserAssignedJobsAsPersonalJobs(userId: string): PersonalJob[] {
    return tasks.filter((t) => t.picId === userId).map((t) => {
        const event = events.find((e) => e.id === t.eventId);
        return {
            id: `assigned-${t.id}`,
            name: t.name,
            description: `Task from event: ${event?.name || "Unknown"}`,
            source: "Assigned" as const,
            picId: t.picId,
            dueDate: t.dueDate,
            priority: "Medium" as const,
            checklist: t.checklist,
            status: t.status,
        };
    });
}
