import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    route("login", "routes/LoginPage.tsx"),
    route("register", "routes/RegisterPage.tsx"),
    layout("layouts/DashboardLayout.tsx", [
        index("routes/Index.tsx"),
        route("dashboard", "routes/DashboardPage.tsx"),
        route("projects", "routes/ProjectsPage.tsx"),
        route("projects/:projectId", "routes/ProjectDetailPage.tsx"),
        route("events", "routes/EventsPage.tsx"),
        route("events/:eventId", "routes/EventDetailPage.tsx"),
        route("tasks/:taskId", "routes/TaskDetailPage.tsx"),
        route("personal-job", "routes/PersonalJobPage.tsx"),
        route("personal-job/:jobId", "routes/PersonalJobDetailPage.tsx"),
        route("regular-activity", "routes/RegularActivityPage.tsx"),
        route("regular-activity/:activityId", "routes/RegularActivityDetailPage.tsx"),
        route("users", "routes/UsersPage.tsx"),
        route("profile", "routes/ProfilePage.tsx"),
    ]),
    route("*", "routes/NotFound.tsx"),
] satisfies RouteConfig;
