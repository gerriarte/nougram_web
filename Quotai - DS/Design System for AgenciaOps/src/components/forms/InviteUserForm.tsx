import { useState, FormEvent } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Loader2, Mail } from 'lucide-react';

interface InviteUserFormProps {
    onSubmit: (data: { email: string; role: string; message: string }) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function InviteUserForm({ onSubmit, onCancel, isLoading = false }: InviteUserFormProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('member');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!email) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit({ email, role, message });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-grey-500" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="colleague@company.com"
                        className={`pl-9 ${errors.email ? 'border-error-500' : ''}`}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                {errors.email && <p className="text-xs text-error-500">{errors.email}</p>}
                <p className="text-xs text-grey-500">We'll send an invitation email with a secure link.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin">
                            <div className="flex flex-col items-start py-1">
                                <span className="font-medium">Admin</span>
                                <span className="text-xs text-grey-500">Full access to settings and billing</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="manager">
                            <div className="flex flex-col items-start py-1">
                                <span className="font-medium">Manager</span>
                                <span className="text-xs text-grey-500">Can manage projects and team</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="member">
                            <div className="flex flex-col items-start py-1">
                                <span className="font-medium">Member</span>
                                <span className="text-xs text-grey-500">Can view and edit assigned projects</span>
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

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" className="bg-primary-500 hover:bg-primary-700 text-white" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        'Send Invitation'
                    )}
                </Button>
            </div>
        </form>
    );
}
