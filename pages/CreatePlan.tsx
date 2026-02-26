import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronRight, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { generateDietPlan, type DietGenerationPayload, ApiError } from '../services/api';
import { useNavigate } from 'react-router-dom';

// Zod schemas for steps
const personalSchema = z.object({
  age: z.number().min(1, 'Age is required'),
  gender: z.enum(['male', 'female', 'other']),
  height: z.number().min(50, 'Invalid height'),
  weight: z.number().min(20, 'Invalid weight'),
});

const medicalSchema = z.object({
  conditions: z.array(z.string()).default([]),
  medications: z.string().optional(),
  allergies: z.string().optional(),
});

const lifestyleSchema = z.object({
  preference: z.enum(['veg', 'non-veg', 'vegan', 'eggetarian']),
  mealsPerDay: z.number().min(1).max(8),
  activityLevel: z.enum(['sedentary', 'moderate', 'active']),
});

const goalSchema = z.object({
  goal: z.enum(['weight_loss', 'weight_gain', 'maintenance', 'recovery']),
});

type FormState = {
  personal: z.infer<typeof personalSchema>;
  medical: z.infer<typeof medicalSchema>;
  lifestyle: z.infer<typeof lifestyleSchema>;
  goal: z.infer<typeof goalSchema>;
};

const Steps = [
  { id: 1, title: 'Personal Info' },
  { id: 2, title: 'Medical Details' },
  { id: 3, title: 'Lifestyle' },
  { id: 4, title: 'Goals' },
  { id: 5, title: 'Review' },
];

export const CreatePlan: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Single comprehensive form state could be managed here or with sub-forms.
  // For simplicity, we keep local state for the accumulated data.
  const [formData, setFormData] = useState<Partial<FormState>>({});

  const handleNext = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleFinalSubmit = async () => {
    setIsGenerating(true);
    setSubmitError(null);
    try {
        const conditions = formData.medical?.conditions ?? [];
        const medicalHistory = conditions.length === 0 || conditions.includes('None')
          ? 'None'
          : conditions.join(', ');

        const preferenceMap: Record<string, DietGenerationPayload['preference']> = {
          veg: 'Veg',
          'non-veg': 'Non-Veg',
          eggetarian: 'Eggetarian',
          vegan: 'Veg',
        };

        const genderMap: Record<string, DietGenerationPayload['gender']> = {
          male: 'Male',
          female: 'Female',
          other: 'Other',
        };

        if (!formData.personal || !formData.lifestyle || !formData.goal) {
          throw new Error('Please complete all steps before submitting.');
        }

        const apiPayload: DietGenerationPayload = {
          age: formData.personal.age,
          gender: genderMap[formData.personal.gender],
          height: String(formData.personal.height),
          weight: String(formData.personal.weight),
          medical_history: medicalHistory,
          medications: formData.medical?.medications?.trim() || 'None',
          allergies: formData.medical?.allergies?.trim() || 'None',
          preference: preferenceMap[formData.lifestyle.preference],
          goal: formData.goal.goal,
        };

        const response = await generateDietPlan(apiPayload);
        console.log('Diet API response:', response.data);
        navigate('/diet-plan');
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to generate diet plan.';
        setSubmitError(message);
        if (e instanceof ApiError) {
          console.warn(`Diet generation failed with status ${e.status}: ${message}`);
        } else {
          console.error(message);
        }
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create New Diet Plan</h1>
        <p className="text-slate-500">Answer a few questions to get a personalized meal plan.</p>
      </div>

      {/* Stepper Indicator */}
      <div className="mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 transform -translate-y-1/2 rounded"></div>
        <div className="flex justify-between">
          {Steps.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            return (
              <div key={step.id} className="flex flex-col items-center bg-slate-50 px-2">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all
                  ${isCompleted ? 'bg-primary-600 text-white' : isCurrent ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-500' : 'bg-slate-200 text-slate-500'}
                `}>
                  {isCompleted ? <Check className="h-5 w-5" /> : step.id}
                </div>
                <span className={`text-xs mt-2 font-medium ${isCurrent ? 'text-primary-700' : 'text-slate-500'}`}>{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        {submitError && (
          <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}
        {currentStep === 1 && <PersonalStep onNext={(d) => handleNext({ personal: d })} defaultValues={formData.personal} />}
        {currentStep === 2 && <MedicalStep onNext={(d) => handleNext({ medical: d })} onBack={handleBack} defaultValues={formData.medical} />}
        {currentStep === 3 && <LifestyleStep onNext={(d) => handleNext({ lifestyle: d })} onBack={handleBack} defaultValues={formData.lifestyle} />}
        {currentStep === 4 && <GoalStep onNext={(d) => handleNext({ goal: d })} onBack={handleBack} defaultValues={formData.goal} />}
        {currentStep === 5 && <ReviewStep data={formData} onBack={handleBack} onSubmit={handleFinalSubmit} isGenerating={isGenerating} />}
      </div>
    </div>
  );
};

// --- Step Components ---

const PersonalStep = ({ onNext, defaultValues }: any) => {
  const { register, handleSubmit, formState: { errors } } = useForm({ 
    resolver: zodResolver(personalSchema),
    defaultValues: defaultValues || { gender: 'male' }
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label">Age</label>
          <input {...register('age', { valueAsNumber: true })} type="number" className="input" placeholder="e.g. 30" />
          {errors.age && <p className="error">{errors.age.message as string}</p>}
        </div>
        <div>
          <label className="label">Gender</label>
          <select {...register('gender')} className="input">
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="label">Height (cm)</label>
          <input {...register('height', { valueAsNumber: true })} type="number" className="input" placeholder="e.g. 175" />
          {errors.height && <p className="error">{errors.height.message as string}</p>}
        </div>
        <div>
          <label className="label">Weight (kg)</label>
          <input {...register('weight', { valueAsNumber: true })} type="number" className="input" placeholder="e.g. 70" />
          {errors.weight && <p className="error">{errors.weight.message as string}</p>}
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <button type="submit" className="btn-primary">Next Step <ChevronRight className="h-4 w-4 ml-2" /></button>
      </div>
    </form>
  );
};

const MedicalStep = ({ onNext, onBack, defaultValues }: any) => {
  const { register, handleSubmit } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <label className="label">Existing Medical Conditions</label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {['Diabetes Type 2', 'Hypertension', 'PCOS', 'Thyroid', 'Cholesterol', 'None'].map((c) => (
             <label key={c} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
               <input type="checkbox" value={c} {...register('conditions')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
               <span className="text-sm text-slate-700">{c}</span>
             </label>
          ))}
        </div>
      </div>
      <div>
        <label className="label">Current Medications (Optional)</label>
        <textarea {...register('medications')} className="input h-24" placeholder="List your current medicines..." />
      </div>
      <div>
        <label className="label">Allergies (Optional)</label>
        <input {...register('allergies')} className="input" placeholder="e.g. Peanuts, Dairy, Gluten" />
      </div>
      <div className="flex justify-between pt-4">
        <button type="button" onClick={onBack} className="btn-secondary"><ChevronLeft className="h-4 w-4 mr-2" /> Back</button>
        <button type="submit" className="btn-primary">Next Step <ChevronRight className="h-4 w-4 ml-2" /></button>
      </div>
    </form>
  );
};

const LifestyleStep = ({ onNext, onBack, defaultValues }: any) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(lifestyleSchema),
    defaultValues: defaultValues || { preference: 'non-veg', mealsPerDay: 3, activityLevel: 'moderate' }
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <label className="label">Dietary Preference</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
           {['veg', 'non-veg', 'vegan', 'eggetarian'].map((type) => (
             <label key={type} className="border has-[:checked]:bg-primary-50 has-[:checked]:border-primary-500 has-[:checked]:text-primary-700 rounded-lg p-3 text-center cursor-pointer capitalize">
               <input type="radio" value={type} {...register('preference')} className="hidden" />
               {type}
             </label>
           ))}
        </div>
      </div>
      <div>
        <label className="label">Meals per Day</label>
        <input type="number" {...register('mealsPerDay', { valueAsNumber: true })} className="input" max={8} min={1} />
        {errors.mealsPerDay && <p className="error">{errors.mealsPerDay.message as string}</p>}
      </div>
      <div>
        <label className="label">Activity Level</label>
        <select {...register('activityLevel')} className="input">
          <option value="sedentary">Sedentary (Little exercise)</option>
          <option value="moderate">Moderate (Exercise 3-5 times/week)</option>
          <option value="active">Active (Daily intense exercise)</option>
        </select>
      </div>
      <div className="flex justify-between pt-4">
        <button type="button" onClick={onBack} className="btn-secondary"><ChevronLeft className="h-4 w-4 mr-2" /> Back</button>
        <button type="submit" className="btn-primary">Next Step <ChevronRight className="h-4 w-4 ml-2" /></button>
      </div>
    </form>
  );
};

const GoalStep = ({ onNext, onBack, defaultValues }: any) => {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: defaultValues || { goal: 'weight_loss' }
  });
  
  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <label className="label block mb-4">What is your primary goal?</label>
        <div className="space-y-3">
          {[
            { id: 'weight_loss', label: 'Weight Loss', desc: 'Reduce body fat sustainably' },
            { id: 'weight_gain', label: 'Weight Gain', desc: 'Build muscle mass and size' },
            { id: 'maintenance', label: 'Maintenance', desc: 'Maintain current healthy weight' },
            { id: 'recovery', label: 'Post-Surgery / Recovery', desc: 'Focus on healing and nutrition' }
          ].map((g) => (
            <label key={g.id} className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
              <input type="radio" value={g.id} {...register('goal')} className="w-5 h-5 text-primary-600 focus:ring-primary-500" />
              <div className="ml-4">
                <span className="block font-medium text-slate-900">{g.label}</span>
                <span className="block text-sm text-slate-500">{g.desc}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-between pt-4">
        <button type="button" onClick={onBack} className="btn-secondary"><ChevronLeft className="h-4 w-4 mr-2" /> Back</button>
        <button type="submit" className="btn-primary">Review Plan <ChevronRight className="h-4 w-4 ml-2" /></button>
      </div>
    </form>
  );
};

const ReviewStep = ({ data, onBack, onSubmit, isGenerating }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 text-sm">
        <h3 className="font-semibold text-slate-900 mb-4 text-base">Summary</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
          <div>
            <dt className="text-slate-500">Name</dt>
            <dd className="font-medium text-slate-900">Jane Doe (You)</dd>
          </div>
          <div>
            <dt className="text-slate-500">Stats</dt>
            <dd className="font-medium text-slate-900">{data.personal.age} yrs, {data.personal.weight}kg</dd>
          </div>
          <div>
            <dt className="text-slate-500">Conditions</dt>
            <dd className="font-medium text-slate-900">
               {data.medical?.conditions?.length > 0 ? data.medical.conditions.join(', ') : 'None'}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Preference</dt>
            <dd className="font-medium text-slate-900 capitalize">{data.lifestyle.preference}</dd>
          </div>
          <div className="col-span-1 sm:col-span-2">
            <dt className="text-slate-500">Goal</dt>
            <dd className="font-medium text-slate-900 capitalize">{data.goal.goal.replace('_', ' ')}</dd>
          </div>
        </dl>
      </div>

      <div className="flex items-start gap-3 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
        <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" required />
            <span>I consent to using my medical data for automated diet planning purposes.</span>
        </label>
      </div>

      <div className="flex justify-between pt-4">
        <button type="button" onClick={onBack} disabled={isGenerating} className="btn-secondary"><ChevronLeft className="h-4 w-4 mr-2" /> Back</button>
        <button 
          onClick={onSubmit} 
          disabled={isGenerating}
          className="btn-primary w-full sm:w-auto ml-auto"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating Plan...
            </>
          ) : (
            'Generate Diet Plan'
          )}
        </button>
      </div>
    </div>
  );
};
