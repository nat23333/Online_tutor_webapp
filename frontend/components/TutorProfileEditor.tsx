'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Upload, Plus, X, GraduationCap, DollarSign, Image as ImageIcon, FileText, Paperclip, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Qualification {
    id: string;
    name: string;
    fileName?: string;
}

interface TutorProfile {
    firstName: string;
    lastName: string;
    headline: string;
    bio: string;
    hourlyRate: number;
    skills: string[];
    qualifications: Qualification[];
    location: string;
    photoUrl?: string;
}

const MOCK_PROFILE: TutorProfile = {
    firstName: 'Abebe',
    lastName: 'Kebede',
    headline: 'Mathematics Expert | PhD in Calculus',
    bio: 'I am a passionate mathematics tutor with over 8 years of experience teaching calculus, algebra, and geometry. I believe every student can master math with the right guidance.',
    hourlyRate: 500,
    skills: ['Mathematics', 'Calculus', 'Algebra', 'Geometry', 'Physics'],
    qualifications: [
        { id: '1', name: 'PhD in Mathematics - AAU' },
        { id: '2', name: 'Certified Tutor - ACE', fileName: 'certificate.pdf' }
    ],
    location: 'Addis Ababa'
};

export function TutorProfileEditor() {
    const router = useRouter();
    const [profile, setProfile] = useState<TutorProfile>(MOCK_PROFILE);
    const [newSkill, setNewSkill] = useState('');
    const [newQualName, setNewQualName] = useState('');
    const [newQualFile, setNewQualFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load initial profile from localStorage if available
    useEffect(() => {
        const savedProfile = localStorage.getItem('tutorProfile');
        if (savedProfile) {
            try {
                setProfile({ ...MOCK_PROFILE, ...JSON.parse(savedProfile) });
            } catch (e) {
                console.error('Failed to parse saved profile', e);
            }
        }
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save to backend
            await api.post('/tutors/profile', profile);

            // Also save to local storage for quick access
            localStorage.setItem('tutorProfile', JSON.stringify(profile));

            toast.success('Profile saved successfully');
            router.push('/dashboard');
        } catch (error) {
            console.error('Failed to save profile', error);
            toast.error('Failed to save profile to server');
            // Still save to local storage as fallback
            localStorage.setItem('tutorProfile', JSON.stringify(profile));
        } finally {
            setIsSaving(false);
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Resize image to avoid localStorage quota limits
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 256;
                    const MAX_HEIGHT = 256;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with 0.7 quality
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    setProfile(prev => ({ ...prev, photoUrl: dataUrl }));
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const addSkill = () => {
        if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
            setProfile(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
            setNewSkill('');
        }
    };

    const removeSkill = (skill: string) => {
        setProfile(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
    };

    const addQualification = () => {
        if (newQualName.trim()) {
            const newQual: Qualification = {
                id: Date.now().toString(),
                name: newQualName.trim(),
                fileName: newQualFile ? newQualFile.name : undefined
            };
            setProfile(prev => ({ ...prev, qualifications: [...prev.qualifications, newQual] }));
            setNewQualName('');
            setNewQualFile(null);
        }
    };

    const removeQual = (id: string) => {
        setProfile(prev => ({ ...prev, qualifications: prev.qualifications.filter(q => q.id !== id) }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold">Edit Profile</h1>
                <p className="text-muted-foreground">Update your profile to attract more students.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Photo & Stats */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Photo</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                            <Avatar className="h-32 w-32 border-4 border-muted">
                                <AvatarImage src={profile.photoUrl} className="object-cover" />
                                <AvatarFallback className="text-4xl">
                                    {profile.firstName[0]}{profile.lastName[0]}
                                </AvatarFallback>
                            </Avatar>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handlePhotoChange}
                            />
                            <Button variant="outline" className="w-full gap-2" onClick={handlePhotoClick}>
                                <Upload className="h-4 w-4" />
                                {profile.photoUrl ? 'Change Photo' : 'Add Photo'}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Availability</CardTitle>
                            <CardDescription>Quick toggle for your visibility.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-green-500/10 border-green-500/20">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="font-semibold text-green-700 dark:text-green-300">Available</span>
                                </div>
                                <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs">Change</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Main Form */}
                <div className="md:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>First Name</Label>
                                    <Input
                                        value={profile.firstName}
                                        onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input
                                        value={profile.lastName}
                                        onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Professional Headline</Label>
                                <Input
                                    value={profile.headline}
                                    onChange={e => setProfile({ ...profile, headline: e.target.value })}
                                    placeholder="e.g. Expert Math Tutor for High School Students"
                                />
                                <p className="text-xs text-muted-foreground">This is the first thing students see on your profile.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input
                                    value={profile.location}
                                    onChange={e => setProfile({ ...profile, location: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bio */}
                    <Card>
                        <CardHeader>
                            <CardTitle>About You</CardTitle>
                            <CardDescription>Tell students about your teaching style and experience.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                className="min-h-[150px]"
                                value={profile.bio}
                                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                placeholder="Write a compelling bio..."
                            />
                        </CardContent>
                    </Card>

                    {/* Hourly Rate */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Hourly Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1">
                                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        className="pl-9"
                                        value={profile.hourlyRate}
                                        onChange={e => setProfile({ ...profile, hourlyRate: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <span className="font-semibold text-muted-foreground">ETB / hr</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Service fee of 5% will be deducted from each booking.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Skills */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Skills & Expertise</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add a skill (e.g. Calculus)"
                                    value={newSkill}
                                    onChange={e => setNewSkill(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addSkill()}
                                />
                                <Button onClick={addSkill} size="icon" variant="secondary">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map(skill => (
                                    <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm gap-2">
                                        {skill}
                                        <X
                                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                                            onClick={() => removeSkill(skill)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Qualifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Education & Qualifications</CardTitle>
                            <CardDescription>Add your degrees and certifications. You can attach documents for verification.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Add New Qualification */}
                            <div className="space-y-4 border p-4 rounded-lg bg-muted/20">
                                <div className="space-y-2">
                                    <Label>Qualification Title</Label>
                                    <Input
                                        placeholder="e.g. PhD in Mathematics"
                                        value={newQualName}
                                        onChange={e => setNewQualName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addQualification()}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Attachment (Optional)</Label>
                                    <div className="flex gap-2 items-center">
                                        <Input
                                            type="file"
                                            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                            onChange={e => setNewQualFile(e.target.files?.[0] || null)}
                                        />
                                    </div>
                                    {newQualFile && (
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Paperclip className="h-3 w-3" />
                                            Selected: {newQualFile.name}
                                        </div>
                                    )}
                                </div>
                                <Button onClick={addQualification} className="w-full gap-2" variant="secondary" disabled={!newQualName.trim()}>
                                    <Plus className="h-4 w-4" /> Add Qualification
                                </Button>
                            </div>

                            <Separator />

                            {/* List Qualifications */}
                            <div className="space-y-3">
                                {profile.qualifications.length === 0 && (
                                    <p className="text-center text-sm text-muted-foreground py-4">
                                        No qualifications added yet.
                                    </p>
                                )}
                                {profile.qualifications.map(qual => (
                                    <div key={qual.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-all">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="h-5 w-5 text-primary" />
                                                <span className="font-semibold">{qual.name}</span>
                                            </div>
                                            {qual.fileName && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground ml-7">
                                                    <FileText className="h-3 w-3" />
                                                    <span>{qual.fileName}</span>
                                                    <Badge variant="outline" className="text-[10px] h-4 py-0 px-1 border-green-500/20 bg-green-500/10 text-green-600">Attached</Badge>
                                                </div>
                                            )}
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => removeQual(qual.id)} className="text-muted-foreground hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4 pt-4">
                        <Button variant="outline" size="lg" onClick={() => router.back()}>Cancel</Button>
                        <Button size="lg" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Saving Profile...' : 'Save Profile'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
