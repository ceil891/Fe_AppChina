export interface RoadmapStep { stage: string; title: string; path: string; status: 'COMPLETED' | 'STARTED' | 'NEW' }

export function nextRoadmapStep(steps: RoadmapStep[]) {
  return steps.find(step => step.status === 'STARTED') ?? steps.find(step => step.status === 'NEW')
}
