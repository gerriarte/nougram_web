import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface InviteUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInvite: (data: { email: string; role: string; message: string }) => void;
}

export function InviteUserDialog({ open, onOpenChange, onInvite }: InviteUserDialogProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('org_member');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);

        // Simulate API delay
        setTimeout(() => {
            setIsLoading(false);
            onInvite({ email, role, message });
            toast.success(`Invitation sent to ${email}`);
            onOpenChange(false);
            // Reset form
            setEmail('');
            setRole('org_member');
            setMessage('');
        }, 1500);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-grey-500" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="colleague@company.com"
                                className="pl-9"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <p className="text-xs text-grey-500">We'll send an invitation email with a secure link.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="org_admin">
                                    <div className="flex flex-col items-start py-1">
                                        <span className="font-medium">Admin</span>
                                        <span className="text-xs text-grey-500">Full access to settings and billing</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="org_member">
                                    <div className="flex flex-col items-start py-1">
                                        <span className="font-medium">Member</span>
                                        <span className="text-xs text-grey-500">Can view and edit projects</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Personal Message (Optional)</Label>
                        <Textarea
                            id="message"
                            placeholder="Hey, join our workspace on Nougram!"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="resize-none"
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                'Send Invitation'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
