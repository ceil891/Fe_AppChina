export interface Course { id: number; title: string; description: string }
export interface CourseDetail { course: Course; lessons: { id: number; title: string }[] }
