import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Eye, EyeOff, Check, Loader2 } from 'lucide-react';

interface RegisterPageProps {
    onRegister: () => void;
    onLoginClick: () => void;
}

export function RegisterPage({ onRegister, onLoginClick }: RegisterPageProps) {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [orgName, setOrgName] = useState('');
    const [orgSlug, setOrgSlug] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [country, setCountry] = useState('');
    const [currency, setCurrency] = useState('');

    const [showPassword, setShowPassword] = useState(false);

    // Auto-generate slug
    const handleOrgNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setOrgName(name);
        setOrgSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
    };

    const handleNext = () => {
        setStep(step + 1);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            onRegister();
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-grey-50 flex items-center justify-center p-4">
            <div className="w-full max-w-[600px] bg-white rounded-2xl shadow-xl border border-grey-200 overflow-hidden">
                {/* Header */}
                <div className="bg-white p-8 border-b border-grey-100 text-center">
                    <div className="w-12 h-12 bg-primary-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-primary-200">
                        <span className="text-white font-bold text-xl">A</span>
                    </div>
                    <h2 className="text-2xl font-bold text-grey-900">Create your organization</h2>
                    <p className="text-grey-600 mt-2">Start managing your agency efficiently</p>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-2 mt-6">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step >= s ? 'bg-primary-600 text-white' : 'bg-grey-100 text-grey-500'
                                    }`}>
                                    {step > s ? <Check className="w-4 h-4" /> : s}
                                </div>
                                {s < 3 && (
                                    <div className={`w-12 h-1 mx-2 rounded-full ${step > s ? 'bg-primary-600' : 'bg-grey-100'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-8">
                    <form onSubmit={handleSubmit}>
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label htmlFor="orgName">Organization Name</Label>
                                    <Input
                                        id="orgName"
                                        placeholder="e.g. Acme Creative Agency"
                                        value={orgName}
                                        onChange={handleOrgNameChange}
                                        className="h-11"
                                        autoFocus
                                    />
                                    <p className="text-xs text-grey-500">This will be the visible name of your organization.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="orgSlug">Organization URL</Label>
                                    <div className="flex rounded-lg shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-grey-300 bg-grey-50 text-grey-500 text-sm">
                                            Nougram.com/
                                        </span>
                                        <Input
                                            id="orgSlug"
                                            value={orgSlug}
                                            onChange={(e) => setOrgSlug(e.target.value)}
                                            className="rounded-l-none h-11 font-mono text-sm"
                                        />
                                    </div>
                                    <p className="text-xs text-grey-500">Unique URL for your organization's workspace.</p>
                                </div>

                                <Button
                                    type="button"
                                    className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white mt-4"
                                    onClick={handleNext}
                                    disabled={!orgName || !orgSlug}
                                >
                                    Continue
                                </Button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        placeholder="John Doe"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="h-11"
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Work Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@acme.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="h-11 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-500 hover:text-grey-700"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="h-11"
                                    />
                                </div>

                                <Button
                                    type="button"
                                    className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white mt-4"
                                    onClick={handleNext}
                                    disabled={!fullName || !email || !password || password !== confirmPassword}
                                >
                                    Continue
                                </Button>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country / Region</Label>
                                    <Select value={country} onValueChange={setCountry}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Select country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="US">United States</SelectItem>
                                            <SelectItem value="UK">United Kingdom</SelectItem>
                                            <SelectItem value="ES">Spain</SelectItem>
                                            <SelectItem value="MX">Mexico</SelectItem>
                                            <SelectItem value="CO">Colombia</SelectItem>
                                            <SelectItem value="AR">Argentina</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-grey-500">Used to adjust default currency and tax settings.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="currency">Default Currency</Label>
                                    <Select value={currency} onValueChange={setCurrency}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                            <SelectItem value="MXN">MXN - Mexican Peso</SelectItem>
                                            <SelectItem value="COP">COP - Colombian Peso</SelectItem>
                                            <SelectItem value="ARS">ARS - Argentine Peso</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white mt-4"
                                    disabled={isLoading || !country || !currency}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating Organization...
                                        </>
                                    ) : (
                                        'Complete Registration'
                                    )}
                                </Button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="bg-grey-50 p-4 text-center border-t border-grey-100">
                    <p className="text-sm text-grey-600">
                        Already have an account?{' '}
                        <button
                            onClick={onLoginClick}
                            className="text-primary-600 font-medium hover:underline"
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
