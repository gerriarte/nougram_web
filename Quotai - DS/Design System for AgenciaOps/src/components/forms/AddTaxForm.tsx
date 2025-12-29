import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';

interface AddTaxFormProps {
    onSubmit: (data: { name: string; rate: number; isDefault: boolean }) => void;
    onCancel: () => void;
}

export function AddTaxForm({ onSubmit, onCancel }: AddTaxFormProps) {
    const [name, setName] = useState('');
    const [rate, setRate] = useState('');
    const [isDefault, setIsDefault] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!name.trim()) newErrors.name = 'Tax name is required';
        if (!rate || parseFloat(rate) < 0) newErrors.rate = 'Valid tax rate is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit({
            name,
            rate: parseFloat(rate),
            isDefault
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Tax Name</Label>
                <Input
                    id="name"
                    placeholder="e.g. VAT, Sales Tax"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={errors.name ? 'border-error-500' : ''}
                />
                {errors.name && <p className="text-xs text-error-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="rate">Tax Rate (%)</Label>
                <Input
                    id="rate"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="20"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className={errors.rate ? 'border-error-500' : ''}
                />
                {errors.rate && <p className="text-xs text-error-500">{errors.rate}</p>}
            </div>

            <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                    id="isDefault"
                    checked={isDefault}
                    onCheckedChange={(checked) => setIsDefault(checked as boolean)}
                />
                <Label htmlFor="isDefault" className="font-normal cursor-pointer">
                    Set as default tax rate
                </Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" className="bg-primary-500 hover:bg-primary-700 text-white">
                    Add Tax Rate
                </Button>
            </div>
        </form>
    );
}
