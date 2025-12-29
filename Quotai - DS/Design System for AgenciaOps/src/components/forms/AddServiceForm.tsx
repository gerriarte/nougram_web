import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface AddServiceFormProps {
    onSubmit: (data: { name: string; category: string; defaultHourlyRate: number }) => void;
    onCancel: () => void;
}

const CATEGORIES = ['Development', 'Design', 'Management', 'Testing', 'Content', 'Infrastructure', 'Strategy', 'Marketing', 'Other'];

export function AddServiceForm({ onSubmit, onCancel }: AddServiceFormProps) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [defaultHourlyRate, setDefaultHourlyRate] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!name.trim()) newErrors.name = 'Service name is required';
        if (!category) newErrors.category = 'Category is required';
        if (!defaultHourlyRate || parseFloat(defaultHourlyRate) <= 0) newErrors.defaultHourlyRate = 'Valid hourly rate is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit({
            name,
            category,
            defaultHourlyRate: parseFloat(defaultHourlyRate)
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                    id="name"
                    placeholder="e.g. UI/UX Design"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={errors.name ? 'border-error-500' : ''}
                />
                {errors.name && <p className="text-xs text-error-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className={errors.category ? 'border-error-500' : ''}>
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                                {cat}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-error-500">{errors.category}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="rate">Default Hourly Rate ($)</Label>
                <Input
                    id="rate"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={defaultHourlyRate}
                    onChange={(e) => setDefaultHourlyRate(e.target.value)}
                    className={errors.defaultHourlyRate ? 'border-error-500' : ''}
                />
                {errors.defaultHourlyRate && <p className="text-xs text-error-500">{errors.defaultHourlyRate}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" className="bg-primary-500 hover:bg-primary-700 text-white">
                    Add Service
                </Button>
            </div>
        </form>
    );
}
