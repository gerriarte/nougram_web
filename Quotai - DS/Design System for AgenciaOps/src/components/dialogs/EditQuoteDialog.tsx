import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Project, ProjectStatus } from '../../lib/types';
import { Loader2 } from 'lucide-react';

interface EditQuoteDialogProps {
    project: Project;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedProject: Project) => void;
}

export function EditQuoteDialog({ project, isOpen, onClose, onSave }: EditQuoteDialogProps) {
    const [formData, setFormData] = useState<Partial<Project>>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name,
                client: project.client,
                clientEmail: project.clientEmail,
                status: project.status,
            });
        }
    }, [project, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            onSave({ ...project, ...formData } as Project);
            setIsLoading(false);
            onClose();
        }, 1000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Quote Details</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                            id="name"
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Project Name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="client">Client Name</Label>
                        <Input
                            id="client"
                            value={formData.client || ''}
                            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                            placeholder="Client Name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Client Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.clientEmail || ''}
                            onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                            placeholder="client@example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData({ ...formData, status: value as ProjectStatus })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="sent">Sent</SelectItem>
                                <SelectItem value="won">Won</SelectItem>
                                <SelectItem value="lost">Lost</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-primary-500 hover:bg-primary-700 text-white" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
