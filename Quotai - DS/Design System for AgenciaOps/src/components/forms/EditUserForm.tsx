import { useState, FormEvent } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, Mail, User as UserIcon } from 'lucide-react';
import { User } from '../../lib/types';

interface EditUserFormProps {
    user: User;
    onSubmit: (data: { role: string }) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function EditUserForm({ user, onSubmit, onCancel, isLoading = false }: EditUserFormProps) {
    const [role, setRole] = useState(user.role);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit({ role });
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
                        value={user.email}
                        disabled
                        className="pl-9 bg-grey-50 text-grey-500"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-grey-500" />
                    <Input
                        id="name"
                        type="text"
                        value={user.name}
                        disabled
                        className="pl-9 bg-grey-50 text-grey-500"
                    />
                </div>
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

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
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
            </div>
        </form>
    );
}
