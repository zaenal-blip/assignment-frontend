export type UserRole = "Admin" | "Leader" | "SPV" | "DPH" | "Member";

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    avatar: string;
    status: "Active" | "Inactive";
}

export interface ChecklistItem {
    id: string;
    label: string;
    completed: boolean;
}

export interface Task {
    id: string;
    name: string;
    eventId: string;
    picId: string;
    dueDate: string;
    checklist: ChecklistItem[];
    status: "Not Started" | "In Progress" | "Completed";
}

export interface Event {
    id: string;
    name: string;
    projectId: string;
    picId: string;
    date: string;
    endDate?: string;
    description: string;
    status: "Planned" | "In Progress" | "Completed";
}

export interface Project {
    id: string;
    name: string;
    ownerId: string;
    description: string;
    status: "Active" | "On Hold" | "Completed";
    startDate: string;
    endDate: string;
    createdAt: string;
}

export interface Activity {
    id: string;
    message: string;
    timestamp: string;
    userId: string;
    type: "task" | "event" | "project" | "checklist";
}

export function calculateTaskProgress(task: Task): number {
    if (task.checklist.length === 0) return 0;
    const completed = task.checklist.filter((c) => c.completed).length;
    return Math.round((completed / task.checklist.length) * 100);
}

export function calculateEventProgress(tasks: Task[]): number {
    if (tasks.length === 0) return 0;
    const totalChecklist = tasks.reduce((sum, t) => sum + t.checklist.length, 0);
    if (totalChecklist === 0) return 0;
    const completedChecklist = tasks.reduce(
        (sum, t) => sum + t.checklist.filter((c) => c.completed).length,
        0
    );
    return Math.round((completedChecklist / totalChecklist) * 100);
}

export function calculateProjectProgress(events: Event[], tasks: Task[]): number {
    const projectTasks = tasks.filter((t) =>
        events.some((e) => e.id === t.eventId)
    );
    return calculateEventProgress(projectTasks);
}

export type RegularActivityCategory = "Safety" | "Quality" | "Maintenance" | "5S" | "Environment";
export type RegularActivityFrequency = "Daily" | "Weekly" | "Monthly";
export type RegularActivityStatus = "Completed" | "Pending" | "Overdue";

export interface RegularActivity {
    id: string;
    name: string;
    category: RegularActivityCategory;
    frequency: RegularActivityFrequency;
    picId: string;
    date: string;
    startTime: string;
    endTime: string;
    lastUpdate: string;
    status: RegularActivityStatus;
    checklist: ChecklistItem[];
}

export function calculateRegularActivityProgress(activity: RegularActivity): number {
    if (activity.checklist.length === 0) return 0;
    const completed = activity.checklist.filter((c) => c.completed).length;
    return Math.round((completed / activity.checklist.length) * 100);
}

export type PersonalJobPriority = "Low" | "Medium" | "High";
export type PersonalJobSource = "Assigned" | "Personal";

export interface PersonalJob {
    id: string;
    name: string;
    description: string;
    source: PersonalJobSource;
    picId: string;
    dueDate: string;
    priority: PersonalJobPriority;
    checklist: ChecklistItem[];
    status: "Not Started" | "In Progress" | "Completed";
}

export function calculatePersonalJobProgress(job: PersonalJob): number {
    if (job.checklist.length === 0) return 0;
    const completed = job.checklist.filter((c) => c.completed).length;
    return Math.round((completed / job.checklist.length) * 100);
}
