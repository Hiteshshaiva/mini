import { useState, useEffect } from 'react';
import { DreamInput } from './DreamInput';
import { Roadmap } from './Roadmap';
import { CalendarView } from './CalendarView';
import { TodoList } from './TodoList';
import { MotivationalQuote } from './MotivationalQuote';
import { Resources } from './Resources';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Sparkles, LogOut, Save, Loader2 } from 'lucide-react';
import { useAuth } from './AuthContext';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner';

export interface Dream {
  title: string;
  description: string;
  timeline: number; // in months
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  month: number;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  milestoneId: string;
  completed: boolean;
  dueDate: Date;
}

export interface Resource {
  id: string;
  title: string;
  type: 'book' | 'course' | 'article' | 'video';
  url: string;
  description: string;
}

export function DreamApp() {
  const { user, logout } = useAuth();
  const [dream, setDream] = useState<Dream | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadDreamData();
  }, [user]);

  // Auto-save when data changes
  useEffect(() => {
    if (hasGenerated && !isLoading) {
      const timeoutId = setTimeout(() => {
        saveDreamData();
      }, 2000); // Auto-save after 2 seconds of no changes

      return () => clearTimeout(timeoutId);
    }
  }, [dream, milestones, tasks, resources, hasGenerated, isLoading]);

  const loadDreamData = async () => {
    if (!user?.accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-683179bd/dreams/load`,
        {
          headers: {
            'Authorization': `Bearer ${user.accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        if (data.dream) {
          setDream(data.dream);
          setMilestones(data.milestones || []);
          
          // Parse task dates
          const parsedTasks = (data.tasks || []).map((task: any) => ({
            ...task,
            dueDate: new Date(task.dueDate),
          }));
          setTasks(parsedTasks);
          
          setResources(data.resources || []);
          setHasGenerated(true);
        }
      }
    } catch (error) {
      console.error('Error loading dream data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDreamData = async () => {
    if (!user?.accessToken || !hasGenerated) return;

    setIsSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-683179bd/dreams/save`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify({
            dream,
            milestones,
            tasks,
            resources,
          }),
        }
      );

      if (response.ok) {
        console.log('Dream data saved successfully');
      } else {
        console.error('Failed to save dream data');
      }
    } catch (error) {
      console.error('Error saving dream data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDreamSubmit = (dreamData: Dream) => {
    setDream(dreamData);
    generateRoadmap(dreamData);
    setHasGenerated(true);
    toast.success('Dream roadmap generated!');
  };

  const generateRoadmap = (dreamData: Dream) => {
    // Simulate AI-generated roadmap
    const numberOfMilestones = Math.min(Math.ceil(dreamData.timeline / 2), 12);
    const generatedMilestones: Milestone[] = [];
    const generatedTasks: Task[] = [];
    const generatedResources: Resource[] = [];

    // Generate milestones
    for (let i = 0; i < numberOfMilestones; i++) {
      const monthInterval = Math.ceil(dreamData.timeline / numberOfMilestones);
      const milestone: Milestone = {
        id: `milestone-${i}`,
        title: getMilestoneTitle(dreamData.title, i, numberOfMilestones),
        description: getMilestoneDescription(dreamData.title, i, numberOfMilestones),
        month: (i + 1) * monthInterval,
        completed: false,
      };
      generatedMilestones.push(milestone);

      // Generate 3-4 tasks per milestone
      const tasksPerMilestone = 3 + Math.floor(Math.random() * 2);
      for (let j = 0; j < tasksPerMilestone; j++) {
        const taskMonth = milestone.month;
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + taskMonth);
        dueDate.setDate(Math.floor(Math.random() * 28) + 1);

        generatedTasks.push({
          id: `task-${i}-${j}`,
          title: getTaskTitle(milestone.title, j),
          milestoneId: milestone.id,
          completed: false,
          dueDate,
        });
      }
    }

    // Generate resources
    const resourceTypes: Resource['type'][] = ['book', 'course', 'article', 'video'];
    for (let i = 0; i < 8; i++) {
      generatedResources.push({
        id: `resource-${i}`,
        title: getResourceTitle(dreamData.title, i),
        type: resourceTypes[i % 4],
        url: '#',
        description: getResourceDescription(dreamData.title, i),
      });
    }

    setMilestones(generatedMilestones);
    setTasks(generatedTasks);
    setResources(generatedResources);
  };

  const getMilestoneTitle = (dream: string, index: number, total: number): string => {
    const phases = [
      'Research and Discovery',
      'Foundation Building',
      'Skill Development',
      'Practical Application',
      'Network and Connect',
      'Advanced Learning',
      'Project Implementation',
      'Refinement and Growth',
      'Mastery and Expertise',
      'Community Contribution',
      'Professional Development',
      'Goal Achievement',
    ];
    return phases[index] || `Phase ${index + 1}`;
  };

  const getMilestoneDescription = (dream: string, index: number, total: number): string => {
    const descriptions = [
      'Explore and understand the fundamentals of your dream field',
      'Build a strong foundation with essential knowledge and skills',
      'Develop core competencies through dedicated practice',
      'Apply your learning to real-world scenarios and projects',
      'Connect with mentors and peers in your field',
      'Dive deeper into advanced concepts and techniques',
      'Execute meaningful projects that showcase your abilities',
      'Refine your approach and expand your capabilities',
      'Achieve mastery through consistent practice and learning',
      'Share your knowledge and give back to the community',
      'Continue professional growth and development',
      'Reach your ultimate goal and set new aspirations',
    ];
    return descriptions[index] || `Continue progressing towards ${dream}`;
  };

  const getTaskTitle = (milestoneTitle: string, index: number): string => {
    const taskPrefixes = [
      'Complete',
      'Study',
      'Practice',
      'Research',
      'Connect with',
      'Create',
      'Review',
    ];
    const prefix = taskPrefixes[index % taskPrefixes.length];
    return `${prefix} ${milestoneTitle.toLowerCase().split(' ').slice(0, 2).join(' ')} activities`;
  };

  const getResourceTitle = (dream: string, index: number): string => {
    const resourceTitles = [
      `The Complete Guide to ${dream}`,
      `Mastering ${dream}: A Beginner's Journey`,
      `Essential Skills for ${dream}`,
      `${dream} Masterclass`,
      `The Path to ${dream} Success`,
      `Advanced Techniques in ${dream}`,
      `${dream}: From Novice to Expert`,
      `Building a Career in ${dream}`,
    ];
    return resourceTitles[index] || `Resource for ${dream}`;
  };

  const getResourceDescription = (dream: string, index: number): string => {
    return `Comprehensive resource to help you progress in your journey towards ${dream}`;
  };

  const toggleMilestone = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const addTask = (title: string, milestoneId: string, dueDate: Date) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      milestoneId,
      completed: false,
      dueDate,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dreams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1" />
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-10 h-10 text-purple-600" />
              <h1 className="text-purple-600">DreamPath AI</h1>
            </div>
            <div className="flex-1 flex justify-end">
              <div className="flex items-center gap-3">
                {isSaving && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                )}
                <div className="text-right">
                  <p className="text-gray-600 text-sm">Welcome back,</p>
                  <p className="text-purple-600">{user?.name}</p>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Transform your childhood dreams into achievable goals with AI-powered roadmaps,
            personalized milestones, and daily motivation
          </p>
        </div>

        {!hasGenerated ? (
          <DreamInput onSubmit={handleDreamSubmit} />
        ) : (
          <div className="space-y-8">
            {/* Motivational Quote */}
            <MotivationalQuote />

            {/* Main Content Tabs */}
            <Tabs defaultValue="roadmap" className="w-full">
              <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
                <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>

              <TabsContent value="roadmap" className="mt-6">
                <Roadmap
                  dream={dream!}
                  milestones={milestones}
                  onToggleMilestone={toggleMilestone}
                />
              </TabsContent>

              <TabsContent value="calendar" className="mt-6">
                <CalendarView milestones={milestones} tasks={tasks} />
              </TabsContent>

              <TabsContent value="tasks" className="mt-6">
                <TodoList
                  tasks={tasks}
                  milestones={milestones}
                  onToggleTask={toggleTask}
                  onDeleteTask={deleteTask}
                  onAddTask={addTask}
                />
              </TabsContent>

              <TabsContent value="resources" className="mt-6">
                <Resources resources={resources} dream={dream!} />
              </TabsContent>
            </Tabs>

            {/* Reset Button */}
            <div className="text-center pt-8">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to start a new dream? Your current progress will be saved.')) {
                    setHasGenerated(false);
                    setDream(null);
                    setMilestones([]);
                    setTasks([]);
                    setResources([]);
                  }
                }}
                className="text-purple-600 hover:text-purple-700 underline"
              >
                Start a new dream journey
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}