import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Heart, Target } from 'lucide-react';
import type { Dream } from './DreamApp';

interface DreamInputProps {
  onSubmit: (dream: Dream) => void;
}

export function DreamInput({ onSubmit }: DreamInputProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeline, setTimeline] = useState([12]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && description) {
      onSubmit({
        title,
        description,
        timeline: timeline[0],
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl border-2 border-purple-100">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <CardTitle>What's Your Dream?</CardTitle>
              <CardDescription>
                Share your long-lost or childhood dream, and we'll help you achieve it
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dream Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Dream Title</Label>
              <Input
                id="title"
                placeholder="e.g., Become a Professional Photographer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Dream Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Tell us about your dream</Label>
              <Textarea
                id="description"
                placeholder="Describe your dream in detail... What inspired it? Why is it important to you? What do you hope to achieve?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                required
              />
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="timeline">Timeline to Achieve</Label>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span className="text-purple-600">{timeline[0]} months</span>
                </div>
              </div>
              <Slider
                id="timeline"
                min={3}
                max={60}
                step={3}
                value={timeline}
                onValueChange={setTimeline}
                className="py-4"
              />
              <div className="flex justify-between text-gray-500 text-sm">
                <span>3 months</span>
                <span>5 years</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg">
              Generate My Dream Roadmap
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}