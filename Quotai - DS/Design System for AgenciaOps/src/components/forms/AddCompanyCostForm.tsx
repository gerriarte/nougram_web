import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface AddCompanyCostFormProps {
    onSubmit: (data: { name: string; amount: number; type: 'fixed' | 'variable'; frequency: 'monthly' | 'yearly' }) => void;
    onCancel: () => void;
}

export function AddCompanyCostForm({ onSubmit, onCancel }: AddCompanyCostFormProps) {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'fixed' | 'variable'>('fixed');
    const [frequency, setFrequency] = useState<'monthly' | 'yearly'>('monthly');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!name.trim()) newErrors.name = 'Cost name is required';
        if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Valid amount is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit({
            name,
            amount: parseFloat(amount),
            type,
            frequency
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Cost Name</Label>
                <Input
                    id="name"
                    placeholder="e.g. Office Rent, Software Licenses"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={errors.name ? 'border-error-500' : ''}
                />
                {errors.name && <p className="text-xs text-error-500">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={type} onValueChange={(v) => setType(v as 'fixed' | 'variable')}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="fixed">Fixed Cost</SelectItem>
                            <SelectItem value="variable">Variable Cost</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={frequency} onValueChange={(v) => setFrequency(v as 'monthly' | 'yearly')}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={errors.amount ? 'border-error-500' : ''}
                />
                {errors.amount && <p className="text-xs text-error-500">{errors.amount}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" className="bg-primary-500 hover:bg-primary-700 text-white">
                    Add Company Cost
                </Button>
            </div>
        </form>
    );
}
