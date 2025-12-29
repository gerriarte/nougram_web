import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Cost } from '../../lib/types';

interface AddTeamMemberFormProps {
    costs: Cost[];
    onSubmit: (data: { name: string; role: string; email: string; costId?: string }) => void;
    onCancel: () => void;
}

export function AddTeamMemberForm({ costs, onSubmit, onCancel }: AddTeamMemberFormProps) {
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [email, setEmail] = useState('');
    const [costId, setCostId] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!name.trim()) newErrors.name = 'Name is required';
        if (!role.trim()) newErrors.role = 'Role is required';
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Valid email is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit({
            name,
            role,
            email,
            costId: costId || undefined
        });
    };

    // Auto-fill role if cost is selected
    const handleCostChange = (value: string) => {
        setCostId(value);
        const selectedCost = costs.find(c => c.id === value);
        if (selectedCost && !role) {
            setRole(selectedCost.name);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                    id="name"
                    placeholder="e.g. Sarah Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={errors.name ? 'border-error-500' : ''}
                />
                {errors.name && <p className="text-xs text-error-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="sarah@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? 'border-error-500' : ''}
                />
                {errors.email && <p className="text-xs text-error-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="cost">Cost Role (Optional)</Label>
                <Select value={costId} onValueChange={handleCostChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select cost role to link rate" />
                    </SelectTrigger>
                    <SelectContent>
                        {costs.filter(c => c.isActive).map((cost) => (
                            <SelectItem key={cost.id} value={cost.id}>
                                {cost.name} (${cost.hourlyRate}/hr)
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-grey-500">Linking a cost role allows automatic margin calculations.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="role">Job Title / Role</Label>
                <Input
                    id="role"
                    placeholder="e.g. Senior Developer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className={errors.role ? 'border-error-500' : ''}
                />
                {errors.role && <p className="text-xs text-error-500">{errors.role}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" className="bg-primary-500 hover:bg-primary-700 text-white">
                    Add Team Member
                </Button>
            </div>
        </form>
    );
}
