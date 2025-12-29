import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Currency } from '../../lib/types';

interface EditCurrencyFormProps {
    currency: Currency;
    onSubmit: (data: { code: string; name: string; symbol: string }) => void;
    onCancel: () => void;
}

export function EditCurrencyForm({ currency, onSubmit, onCancel }: EditCurrencyFormProps) {
    const [code, setCode] = useState(currency.code);
    const [name, setName] = useState(currency.name);
    const [symbol, setSymbol] = useState(currency.symbol);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        setCode(currency.code);
        setName(currency.name);
        setSymbol(currency.symbol);
    }, [currency]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!code.trim()) newErrors.code = 'Currency code is required (e.g. USD)';
        if (!name.trim()) newErrors.name = 'Currency name is required';
        if (!symbol.trim()) newErrors.symbol = 'Currency symbol is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit({
            code: code.toUpperCase(),
            name,
            symbol
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="code">Currency Code</Label>
                <Input
                    id="code"
                    placeholder="e.g. USD, EUR"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className={errors.code ? 'border-error-500' : ''}
                    maxLength={3}
                />
                {errors.code && <p className="text-xs text-error-500">{errors.code}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">Currency Name</Label>
                <Input
                    id="name"
                    placeholder="e.g. US Dollar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={errors.name ? 'border-error-500' : ''}
                />
                {errors.name && <p className="text-xs text-error-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                    id="symbol"
                    placeholder="e.g. $, €"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className={errors.symbol ? 'border-error-500' : ''}
                />
                {errors.symbol && <p className="text-xs text-error-500">{errors.symbol}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" className="bg-primary-500 hover:bg-primary-700 text-white">
                    Save Changes
                </Button>
            </div>
        </form>
    );
}
