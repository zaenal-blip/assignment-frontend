import type {
    User as AppUser,
    UserRole,
    Event as AppEvent,
    Project as AppProject,
    Task as AppTask,
    ChecklistItem,
    PersonalJob as AppPersonalJob,
    RegularActivity as AppRegularActivity,
    AppNotification,
} from "@/types";

export type {
    AppUser,
    UserRole,
    AppEvent,
    AppProject,
    AppTask,
    ChecklistItem,
    AppPersonalJob,
    AppRegularActivity,
    AppNotification,
};

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";
const USER_STORAGE_KEY = "tps_current_user";
const TOKEN_STORAGE_KEY = "tps_access_token";

export type ApiErrorPayload = {
    message: string;
};

export type LoginBody = {
    identifier: string;
    password: string;
};

export type RegisterBody = {
    name: string;
    email: string;
    noReg: string;
    noHp: string;
    role: "MEMBER" | "LEADER" | "SPV" | "DPH" | "TMMIN";
    password: string;
    confirmPassword?: string;
};

interface BackendUser {
    id: number;
    name: string;
    email: string;
    noHp: string;
    role: "MEMBER" | "LEADER" | "SPV" | "DPH" | "TMMIN";
    avatar?: string;
}

interface BackendProject {
    id: number;
    name: string;
    picId: number;
    status: "ACTIVE" | "ON_HOLD" | "COMPLETED";
    startDate: string;
    endDate: string;
    description?: string;
    progress: number;
    createdAt: string;
    updatedAt: string;
    pic?: { id: number; name: string };
    _count?: { tasks: number };
    tasks?: BackendTask[];
}

interface BackendEvent {
    id: number;
    name: string;
    picId: number;
    progress: number;
    startDate: string;
    endDate: string;
    pic?: { id: number; name: string };
    _count?: { tasks: number };
    tasks?: BackendTask[];
}

interface BackendActivity {
    id: number;
    name: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
}

interface BackendTask {
    id: number;
    name: string;
    picId: number;
    progress: number;
    sourceType: "EVENT" | "PROJECT" | "PERSONAL" | "REGULAR";
    status: "TODO" | "IN_PROGRESS" | "DONE";
    priority: "LOW" | "MEDIUM" | "HIGH";
    date?: string;
    startTime?: string;
    endTime?: string;
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
    activities: BackendActivity[];
    event?: { id: number; name: string };
    project?: { id: number; name: string };
    regularJob?: { id: number; name: string };
}

interface BackendRegularJob {
    id: number;
    name: string;
    picId: number;
    category: "SAFETY" | "QUALITY" | "MAINTENANCE" | "FIVE_S" | "ENVIRONMENT";
    frequency: "DAILY" | "WEEKLY" | "MONTHLY";
    progress: number;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    startTime?: string;
    endTime?: string;
    createdAt: string;
    updatedAt: string;
    tasks: BackendTask[];
}

// Notifications
interface BackendNotification {
    id: number;
    userId: number;
    message: string;
    isRead: boolean;
    type?: string;
    createdAt: string;
}

interface BackendListResponse<T> {
    data: T[];
    meta: {
        page: number;
        take: number;
        total: number;
    };
}

function normalizeApiPath(path: string) {
    return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = normalizeApiPath(path);
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
    };

    const response = await fetch(url, { ...options, headers });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
        const message = data?.message || response.statusText || "Request failed";
        throw new Error(message);
    }

    return data as T;
}

function toAppRole(role: BackendUser["role"]): UserRole {
    switch (role) {
        case "LEADER":
            return "Leader";
        case "SPV":
            return "SPV";
        case "DPH":
            return "DPH";
        case "TMMIN":
            return "Yang punya TMMIN";
        case "MEMBER":
        default:
            return "Member";
    }
}

function toBackendRole(role: UserRole): BackendUser["role"] {
    switch (role) {
        case "Leader":
            return "LEADER";
        case "SPV":
            return "SPV";
        case "DPH":
            return "DPH";
        case "Yang punya TMMIN":
            return "TMMIN";
        case "Member":
        default:
            return "MEMBER";
    }
}

function renderAvatar(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");
}

function mapTaskStatus(status: BackendTask["status"]): AppTask["status"] {
    switch (status) {
        case "IN_PROGRESS":
            return "In Progress";
        case "DONE":
            return "Completed";
        default:
            return "Not Started";
    }
}

function mapEventStatus(startDate: string, endDate: string): AppEvent["status"] {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < now) return "Completed";
    if (start <= now) return "In Progress";
    return "Planned";
}

function mapProjectStatus(progress: number): AppProject["status"] {
    return progress >= 100 ? "Completed" : "Active";
}

export function getStoredUser(): AppUser | null {
    try {
        const raw = localStorage.getItem(USER_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as AppUser) : null;
    } catch {
        return null;
    }
}

export function setStoredUser(user: AppUser, token: string) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredUser() {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
}

function getAuthHeaders(): HeadersInit {
    const headers: Record<string, string> = {};
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
}

export function toAppUser(user: BackendUser): AppUser {
    return {
        id: String(user.id),
        name: user.name,
        email: user.email,
        phone: user.noHp,
        role: toAppRole(user.role),
        avatar: user.avatar 
            ? user.avatar.startsWith("http") 
                ? user.avatar 
                : `${API_BASE}${user.avatar}` 
            : renderAvatar(user.name),
        status: "Active",
    };
}

export function toAppProject(project: BackendProject): AppProject {
    return {
        id: String(project.id),
        name: project.name,
        ownerId: String(project.picId),
        description: project.description || "",
        status: project.status === "ACTIVE" ? "Active" : project.status === "ON_HOLD" ? "On Hold" : "Completed",
        startDate: project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : new Date(project.createdAt).toISOString().split("T")[0],
        endDate: project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : new Date(project.updatedAt).toISOString().split("T")[0],
        createdAt: project.createdAt,
    };
}

export function toAppEvent(event: BackendEvent): AppEvent {
    return {
        id: String(event.id),
        name: event.name,
        projectId: "",
        picId: String(event.picId),
        date: new Date(event.startDate).toISOString().split("T")[0],
        endDate: new Date(event.endDate).toISOString().split("T")[0],
        description: "",
        status: mapEventStatus(event.startDate, event.endDate),
    };
}

export function toAppTask(task: BackendTask): AppTask {
    const dueDate = task.dueDate 
        ? new Date(task.dueDate).toISOString().split("T")[0] 
        : new Date(task.updatedAt).toISOString().split("T")[0];

    const checklist: ChecklistItem[] = (task.activities || []).map((activity) => ({
        id: String(activity.id),
        label: activity.name,
        completed: activity.completed,
    }));

    return {
        id: String(task.id),
        name: task.name,
        eventId: task.event ? String(task.event.id) : "",
        picId: String(task.picId),
        dueDate,
        checklist,
        status: mapTaskStatus(task.status),
        projectId: task.project ? String(task.project.id) : "",
        date: task.date,
        startTime: task.startTime,
        endTime: task.endTime,
        priority: task.priority ? (task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()) as any : "Low",
    } as any;
}

export function toAppPersonalJob(task: BackendTask): AppPersonalJob {
    const dueDate = task.dueDate 
        ? new Date(task.dueDate).toISOString().split("T")[0] 
        : new Date(task.updatedAt).toISOString().split("T")[0];

    const checklist: ChecklistItem[] = (task.activities || []).map((activity) => ({
        id: String(activity.id),
        label: activity.name,
        completed: activity.completed,
    }));

    return {
        id: String(task.id),
        name: task.name,
        description: "",
        source: task.sourceType === "PERSONAL" ? "Personal" : "Assigned",
        picId: String(task.picId),
        dueDate,
        priority: task.priority ? (task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()) as any : "Low",
        status: mapTaskStatus(task.status),
        checklist,
    };
}

export function toAppRegularActivity(job: BackendRegularJob): AppRegularActivity {
    const categoryMap: Record<string, string> = {
        SAFETY: "Safety",
        QUALITY: "Quality",
        MAINTENANCE: "Maintenance",
        FIVE_S: "5S",
        ENVIRONMENT: "Environment"
    };

    const frequencyMap: Record<string, string> = {
        DAILY: "Daily",
        WEEKLY: "Weekly",
        MONTHLY: "Monthly"
    };

    return {
        id: String(job.id),
        name: job.name,
        category: categoryMap[job.category] as any || "Safety",
        frequency: frequencyMap[job.frequency] as any || "Daily",
        picId: String(job.picId),
        date: new Date(job.createdAt).toISOString().split("T")[0],
        startTime: job.startTime || "08:00",
        endTime: job.endTime || "09:00",
        priority: job.priority ? (job.priority.charAt(0).toUpperCase() + job.priority.slice(1).toLowerCase()) as any : "Low",
        lastUpdate: new Date(job.updatedAt).toISOString().split("T")[0],
        status: job.progress >= 100 ? "Completed" : "Pending",
        checklist: [],
    };
}

export async function login(body: LoginBody): Promise<AppUser> {
    const data = await request<{ accessToken: string } & BackendUser>("/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
    });

    const user = toAppUser(data);
    setStoredUser(user, data.accessToken);
    return user;
}

export async function register(body: RegisterBody) {
    return request<{ message: string; userId: number }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function getProfile(): Promise<AppUser> {
    const data = await request<BackendUser>("/users/me", {
        headers: getAuthHeaders(),
    });
    return toAppUser(data);
}

export async function updateProfile(formData: FormData): Promise<{ message: string }> {
    const url = normalizeApiPath("/users/me");
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    
    const response = await fetch(url, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
    }

    // Update stored user if name or avatar changed
    const currentUser = getStoredUser();
    if (currentUser) {
        const updatedProfile = await getProfile();
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedProfile));
        window.dispatchEvent(new Event("user-updated"));
    }

    return data;
}

export async function getUsers(): Promise<AppUser[]> {
    const data = await request<BackendListResponse<BackendUser>>("/users?take=50", {
        headers: getAuthHeaders(),
    });
    return data.data.map(toAppUser);
}

export async function updateUser(id: string, body: Partial<AppUser>): Promise<{ message: string }> {
    const backendBody: any = { ...body };
    if (body.role) {
        backendBody.role = toBackendRole(body.role);
    }
    if (body.phone) {
        backendBody.noHp = body.phone;
    }

    return request<{ message: string }>(`/users/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(backendBody),
    });
}

export async function getProjects(): Promise<AppProject[]> {
    const data = await request<BackendListResponse<BackendProject>>("/projects?take=50", {
        headers: getAuthHeaders(),
    });
    return data.data.map(toAppProject);
}

export async function getProjectById(id: string): Promise<AppProject & { tasks: AppTask[] }> {
    const project = await request<BackendProject>(`/projects/${id}`, {
        headers: getAuthHeaders(),
    });
    const tasks = (project.tasks ?? []).map(toAppTask);
    return { ...toAppProject(project), tasks };
}

export async function getEvents(): Promise<AppEvent[]> {
    const data = await request<BackendListResponse<BackendEvent>>("/events?take=50", {
        headers: getAuthHeaders(),
    });
    return data.data.map(toAppEvent);
}

export async function getEventById(id: string): Promise<AppEvent & { tasks: AppTask[] }> {
    const event = await request<BackendEvent>(`/events/${id}`, {
        headers: getAuthHeaders(),
    });
    const tasks = (event.tasks ?? []).map(toAppTask);
    return { ...toAppEvent(event), tasks };
}

export async function createEvent(body: { name: string; picId: number; startDate: string; endDate: string }): Promise<AppEvent> {
    const event = await request<BackendEvent>("/events", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
    });
    return toAppEvent(event);
}

export async function getTasks(sourceType?: string): Promise<AppTask[]> {
    const query = sourceType ? `?take=50&sourceType=${sourceType}` : "?take=50";
    const data = await request<BackendListResponse<BackendTask>>(`/tasks${query}`, {
        headers: getAuthHeaders(),
    });
    return data.data.map(toAppTask);
}

export async function getTaskById(id: string): Promise<AppTask> {
    const task = await request<BackendTask>(`/tasks/${id}`, {
        headers: getAuthHeaders(),
    });
    return toAppTask(task);
}

export async function createTask(data: any): Promise<AppTask> {
    const task = await request<BackendTask>("/tasks", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return toAppTask(task);
}

export async function getPersonalJobById(id: string): Promise<AppPersonalJob> {
    const task = await request<BackendTask>(`/tasks/${id}`, {
        headers: getAuthHeaders(),
    });
    return toAppPersonalJob(task);
}

export async function createProject(data: { name: string; ownerId: number; startDate: string; endDate: string; description?: string }): Promise<AppProject> {
    const result = await request<BackendProject>("/projects", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            name: data.name,
            picId: data.ownerId,
            startDate: data.startDate,
            endDate: data.endDate,
            description: data.description,
        }),
    });
    return toAppProject(result);
}

export async function getRegularActivityById(id: string): Promise<AppRegularActivity> {
    const task = await request<BackendTask>(`/tasks/${id}`, {
        headers: getAuthHeaders(),
    });
    const checklist: ChecklistItem[] = (task.activities || []).map((activity) => ({
        id: String(activity.id),
        label: activity.name,
        completed: activity.completed,
    }));
    return {
        id: String(task.id),
        name: task.name,
        category: "Maintenance" as any,
        frequency: "Daily" as any,
        picId: String(task.picId),
        date: task.date || new Date(task.createdAt).toISOString().split("T")[0],
        startTime: task.startTime || "08:00",
        endTime: task.endTime || "09:00",
        priority: task.priority ? (task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()) as any : "Low",
        lastUpdate: new Date(task.updatedAt).toISOString().split("T")[0],
        status: task.status === "DONE" ? "Completed" : "Pending",
        checklist,
    };
}

export async function getPersonalJobs(): Promise<AppPersonalJob[]> {
    const data = await request<BackendListResponse<BackendTask>>("/personal-jobs?take=50", {
        headers: getAuthHeaders(),
    });
    
    const user = getStoredUser();
    let assigned: BackendTask[] = [];
    if (user) {
        const assignedData = await request<BackendListResponse<BackendTask>>(`/tasks?picId=${user.id}&take=50`, {
            headers: getAuthHeaders(),
        });
        assigned = (assignedData.data || []).filter(t => t.sourceType !== "PERSONAL");
    }

    const personal = (data.data || []).map(toAppPersonalJob);
    const assignedMapped = assigned.map(toAppPersonalJob);

    return [...personal, ...assignedMapped];
}

export async function createPersonalJob(data: { name: string; activities: string[]; dueDate?: string; priority?: string }): Promise<AppPersonalJob> {
    const result = await request<BackendTask>("/personal-jobs", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            ...data,
            priority: data.priority?.toUpperCase()
        }),
    });
    return toAppPersonalJob(result);
}

export async function updatePersonalJob(id: string, data: any): Promise<AppPersonalJob> {
    const result = await request<BackendTask>(`/personal-jobs/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            ...data,
            priority: data.priority?.toUpperCase()
        }),
    });
    return toAppPersonalJob(result);
}

export async function deletePersonalJob(id: string): Promise<void> {
    await request(`/personal-jobs/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
}

// Regular Activities
export async function getRegularActivities(): Promise<AppRegularActivity[]> {
    const data = await request<BackendRegularJob[]>("/regular-jobs", {
        headers: getAuthHeaders(),
    });
    return data.map(toAppRegularActivity);
}

export async function getRegularTasksToday(): Promise<AppTask[]> {
    const data = await request<BackendListResponse<BackendTask>>(`/tasks?sourceType=REGULAR&take=50`, {
        headers: getAuthHeaders(),
    });
    return (data.data || []).map(toAppTask);
}

export async function createRegularJob(data: { name: string; picId: number; category: string; frequency: string; priority: string; date?: string; startTime: string; endTime: string }): Promise<AppRegularActivity> {
    const result = await request<BackendRegularJob>("/regular-jobs", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            ...data,
            category: data.category === "5S" ? "FIVE_S" : data.category.toUpperCase(),
            frequency: data.frequency.toUpperCase(),
            priority: data.priority.toUpperCase()
        }),
    });
    return toAppRegularActivity(result);
}

export async function createRegularTask(regularJobId: string, data: any): Promise<AppTask> {
    const result = await request<BackendTask>(`/regular-jobs/${regularJobId}/tasks`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            ...data,
            priority: data.priority?.toUpperCase() || "LOW"
        }),
    });
    return toAppTask(result);
}

export async function updateRegularJobStatus(id: string, isDone: boolean): Promise<any> {
    return request(`/regular-jobs/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ progress: isDone ? 100 : 0 }),
    });
}

export async function deleteRegularJob(id: string): Promise<void> {
    await request(`/regular-jobs/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
}

export async function updateTaskActivity(taskId: string, activityId: string, isCompleted: boolean): Promise<any> {
    return request(`/tasks/${taskId}/activities`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            activityId: Number(activityId),
            isCompleted
        }),
    });
}

export async function getUsersMapped(): Promise<Record<string, AppUser>> {
    const users = await getUsers();
    return Object.fromEntries(users.map((user) => [user.id, user]));
}

// --- Notifications ---
export function toAppNotification(n: BackendNotification): AppNotification {
    return {
        id: String(n.id),
        message: n.message,
        isRead: n.isRead,
        type: n.type,
        createdAt: new Date(n.createdAt).toISOString()
    };
}

export async function getNotifications(isRead?: boolean): Promise<AppNotification[]> {
    const query = isRead !== undefined ? `?take=50&isRead=${isRead}` : `?take=50`;
    const data = await request<BackendListResponse<BackendNotification>>(`/notifications${query}`, {
        headers: getAuthHeaders(),
    });
    return (data.data || []).map(toAppNotification);
}

export async function markNotificationAsRead(id: string): Promise<void> {
    await request(`/notifications/${id}/read`, {
        method: "PATCH",
        headers: getAuthHeaders(),
    });
}

export async function markAllNotificationsAsRead(): Promise<void> {
    await request(`/notifications/read-all`, {
        method: "PATCH",
        headers: getAuthHeaders(),
    });
}
