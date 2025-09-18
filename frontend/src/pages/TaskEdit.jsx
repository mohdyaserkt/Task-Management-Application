import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import taskService from '../services/taskService';
import { useToast } from '../components/ui/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft } from 'lucide-react';

const TaskEdit = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [effortDays, setEffortDays] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const response = await taskService.getTaskById(id);
      const task = response.task;
      console.log(task)
      setTitle(task.title);
      setDescription(task.description || '');
      setEffortDays(task.effortDays || '');
      setDueDate(format(new Date(task.dueDate), 'yyyy-MM-dd'));
    } catch (error) {
      console.log(error)
      toast({
        title: "Error",
        description: "Failed to fetch task",
        variant: "destructive",
      });
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await taskService.updateTask(id, {
        title,
        description,
        effortDays: effortDays ? parseInt(effortDays) : null,
        dueDate
      });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
      navigate('/tasks');
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update task",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center">
          <Button  variant="ghost" onClick={() => navigate('/tasks')} className="mr-4 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Task</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Edit Task</CardTitle>
              <CardDescription>
                Update the details for your task
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter task description"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="effortDays">Effort (Days)</Label>
                  <Input
                    id="effortDays"
                    type="number"
                    min="1"
                    value={effortDays}
                    onChange={(e) => setEffortDays(e.target.value)}
                    placeholder="Enter effort in days"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => navigate('/tasks')} className="cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" disabled={updating} className="cursor-pointer">
                {updating ? "Updating..." : "Update Task"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default TaskEdit;