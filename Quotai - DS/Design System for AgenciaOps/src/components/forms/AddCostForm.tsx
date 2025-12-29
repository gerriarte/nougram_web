import { useState, useEffect, FormEvent } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface AddCostFormProps {
    onSubmit: (data: { name: string; hourlyRate: number; weeklyHours: number; monthlyCost: number }) => void;
    onCancel: () => void;
}

export function AddCostForm({ onSubmit, onCancel }: AddCostFormProps) {
    const [name, setName] = useState('');
    const [hourlyRate, setHourlyRate] = useState('');
    const [weeklyHours, setWeeklyHours] = useState('40');
    const [monthlyCost, setMonthlyCost] = useState('0');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Calculate monthly cost automatically: Rate * WeeklyHours * 4
    useEffect(() => {
        const rate = parseFloat(hourlyRate) || 0;
        const hours = parseFloat(weeklyHours) || 0;
        if (rate > 0 && hours > 0) {
            setMonthlyCost((rate * hours * 4).toFixed(2));
        }
    }, [hourlyRate, weeklyHours]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!name.trim()) newErrors.name = 'Role name is required';
        if (!hourlyRate || parseFloat(hourlyRate) <= 0) newErrors.hourlyRate = 'Valid hourly rate is required';
        if (!weeklyHours || parseFloat(weeklyHours) <= 0) newErrors.weeklyHours = 'Valid weekly hours are required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit({
            name,
            hourlyRate: parseFloat(hourlyRate),
            weeklyHours: parseFloat(weeklyHours),
            monthlyCost: parseFloat(monthlyCost)
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                    id="name"
                    placeholder="e.g. Senior Developer"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={errors.name ? 'border-error-500' : ''}
                />
                {errors.name && <p className="text-xs text-error-500">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="rate">Hourly Rate ($)</Label>
                    <Input
                        id="rate"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        className={errors.hourlyRate ? 'border-error-500' : ''}
                    />
                    {errors.hourlyRate && <p className="text-xs text-error-500">{errors.hourlyRate}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="hours">Weekly Hours</Label>
                    <Input
                        id="hours"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="40"
                        value={weeklyHours}
                        onChange={(e) => setWeeklyHours(e.target.value)}
                        className={errors.weeklyHours ? 'border-error-500' : ''}
                    />
                    {errors.weeklyHours && <p className="text-xs text-error-500">{errors.weeklyHours}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="monthly">Estimated Monthly Cost ($)</Label>
                <Input
                    id="monthly"
                    type="number"
                    value={monthlyCost}
                    readOnly
                    className="bg-grey-50 text-grey-600"
                />
                <p className="text-xs text-grey-500">Calculated as: Hourly Rate × Weekly Hours × 4 weeks</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" className="bg-primary-500 hover:bg-primary-700 text-white">
                    Add Team Cost
                </Button>
            </div>
        </form>
    );
}
