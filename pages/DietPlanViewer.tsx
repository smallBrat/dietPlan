import React, { useEffect, useMemo, useState } from 'react';
import { getLatestDietPlan } from '../services/api';
import { Clock, Info, Download, ChefHat, Coffee, Sun, Moon, AlertCircle, Loader2 } from 'lucide-react';

type WeeklyPlanDay = {
    breakfast: string[];
    mid_morning: string[];
    lunch: string[];
    evening_snack: string[];
    dinner: string[];
};

type WeeklyPlanData = {
    plan_type: 'weekly';
    calories_per_day: number;
    veg_or_nonveg: string;
    indian_foods_only: boolean;
    weekly_plan: {
        day_1: WeeklyPlanDay;
        day_2: WeeklyPlanDay;
        day_3: WeeklyPlanDay;
        day_4: WeeklyPlanDay;
        day_5: WeeklyPlanDay;
        day_6: WeeklyPlanDay;
        day_7: WeeklyPlanDay;
    };
    precautions: string[];
    disclaimer: string;
};

type LegacyPlanData = {
    daily_meals: {
        early_morning: string[];
        breakfast: string[];
        lunch: string[];
        snacks: string[];
        dinner: string[];
    };
    calories_per_day: number;
    indian_foods_only: boolean;
    veg_or_nonveg: string;
    precautions: string[];
    disclaimer: string;
};

type ApiDietPlan = {
    planData: WeeklyPlanData | LegacyPlanData;
    planVersion?: number;
};

const isWeeklyPlan = (plan: ApiDietPlan | null): plan is ApiDietPlan & { planData: WeeklyPlanData } => {
    return Boolean(plan && plan.planData && 'weekly_plan' in plan.planData && plan.planData.plan_type === 'weekly');
};

export const DietPlanViewer: React.FC = () => {
    const [plan, setPlan] = useState<ApiDietPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeDay, setActiveDay] = useState(1);
    const [downloading, setDownloading] = useState(false);

    const isWeekly = isWeeklyPlan(plan) && plan?.planVersion === 2;
    const weeklyPlanData = isWeekly ? plan!.planData : null;
    const weeklyPlan = weeklyPlanData?.weekly_plan ?? {};

    const orderedDays = useMemo(() => {
        const keys = Object.keys(weeklyPlan).filter((key) => /^day_\d+$/.test(key));
        return keys.sort((a, b) => {
            const aNum = Number(a.replace('day_', ''));
            const bNum = Number(b.replace('day_', ''));
            return aNum - bNum;
        });
    }, [weeklyPlan]);

    const mealMeta = useMemo(
        () => ({
            breakfast: { label: 'Breakfast', icon: Sun, color: 'bg-orange-50 text-orange-700 border-orange-200' },
            mid_morning: { label: 'Mid Morning', icon: Coffee, color: 'bg-slate-50 text-slate-700 border-slate-200' },
            lunch: { label: 'Lunch', icon: ChefHat, color: 'bg-blue-50 text-blue-700 border-blue-200' },
            evening_snack: { label: 'Evening Snack', icon: Coffee, color: 'bg-amber-50 text-amber-700 border-amber-200' },
            dinner: { label: 'Dinner', icon: Moon, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        }),
        []
    );

    const fetchPlan = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getLatestDietPlan();
            console.log('Diet API response:', response.data);
            setPlan(response.data.data.dietPlan as ApiDietPlan);
        } catch (fetchError) {
            const message = fetchError instanceof Error ? fetchError.message : 'Failed to load diet plan.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlan();
    }, []);

    const handleDownloadPDF = async () => {
        if (!plan?._id) return;
        setDownloading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const apiUrl = `/api/diet/${plan._id}/pdf`;
            
            console.log('PDF Download - Starting request:', {
                planId: plan._id,
                apiUrl,
                hasToken: !!token,
                env: import.meta.env.MODE,
            });
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            console.log('PDF Download - Response received:', {
                status: response.status,
                statusText: response.statusText,
                contentType: response.headers.get('content-type'),
                contentLength: response.headers.get('content-length'),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('PDF Download - Error response:', errorText);
                throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
            }
            
            const blob = await response.blob();
            console.log('PDF Download - Blob received:', {
                size: blob.size,
                type: blob.type,
            });
            
            if (blob.size === 0) {
                throw new Error('Received empty PDF - Server may have encountered an error');
            }
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const userName = (plan.userInput?.name || 'DietPlan').replace(/\s+/g, '_');
            link.download = `DietPlan_${userName}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            console.log('PDF Download - Success!');
        } catch (err) {
            console.error('PDF download error:', err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            alert(`Failed to download PDF: ${errorMessage}`);
        } finally {
            setDownloading(false);
        }
    };

    useEffect(() => {
        if (orderedDays.length === 0) {
            return;
        }
        const activeKey = `day_${activeDay}`;
        if (!orderedDays.includes(activeKey)) {
            const firstDay = Number(orderedDays[0]?.replace('day_', ''));
            if (!Number.isNaN(firstDay)) {
                setActiveDay(firstDay);
            }
        }
    }, [activeDay, orderedDays]);

    const currentDayKey = `day_${activeDay}` as keyof WeeklyPlanData['weekly_plan'];
    const fallbackDayKey = orderedDays[0] as keyof WeeklyPlanData['weekly_plan'] | undefined;
    const currentDayPlan = weeklyPlanData?.weekly_plan[currentDayKey]
        ?? (fallbackDayKey ? weeklyPlanData?.weekly_plan[fallbackDayKey] : undefined);
    const mealOrder: Array<keyof WeeklyPlanDay> = ['breakfast', 'mid_morning', 'lunch', 'evening_snack', 'dinner'];

    let content: React.ReactNode = null;
    if (loading) {
        content = (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 text-sm">Generating your weekly diet plan, this may take a few moments...</p>
                </div>
            </div>
        );
    } else if (error) {
        content = (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 mt-0.5" />
                        <span>{error}</span>
                    </div>
                </div>
            </div>
        );
    } else if (!plan) {
        content = null;
    } else if (!isWeekly || !weeklyPlanData || !currentDayPlan) {
        content = (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white border border-amber-200 rounded-xl p-6 text-amber-800">
                    <h1 className="text-xl font-semibold">Legacy Diet Plan Detected</h1>
                    <p className="text-sm mt-2">
                        This plan was generated with an older format. Please create a new weekly plan to view it here.
                    </p>
                </div>
            </div>
        );
    } else {
        const dayNumbers = orderedDays.length > 0
            ? orderedDays.map((day) => Number(day.replace('day_', ''))).filter((day) => !Number.isNaN(day))
            : [1, 2, 3, 4, 5, 6, 7];
        content = (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Your Weekly Diet</h1>
                        <div className="flex flex-wrap items-center gap-3 text-slate-500 text-sm">
                            <span>{weeklyPlanData.calories_per_day} kcal/day</span>
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                {weeklyPlanData.veg_or_nonveg}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="btn-secondary flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {downloading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        {downloading ? 'Generating...' : 'Download PDF'}
                    </button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                    {dayNumbers.map((day) => (
                        <button
                            key={day}
                            onClick={() => setActiveDay(day)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
                                activeDay === day
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Day {day}
                        </button>
                    ))}
                </div>

                <div className="grid gap-6">
                    {mealOrder.map((mealKey) => {
                        const { label, icon: Icon, color } = mealMeta[mealKey];
                        const items = currentDayPlan[mealKey] ?? [];
                        return (
                            <div key={mealKey} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
                                <div className={`p-6 w-full md:w-48 shrink-0 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r ${color} bg-opacity-30`}>
                                    <Icon className="h-8 w-8 mb-2" />
                                    <span className="font-bold uppercase tracking-wide text-sm">{label}</span>
                                    <div className="flex items-center text-xs mt-1 font-medium opacity-80">
                                        <Clock className="h-3 w-3 mr-1" /> As advised
                                    </div>
                                </div>
                                <div className="p-6 flex-1">
                                    <ul className="space-y-3">
                                        {items.map((item, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary-500 mt-2"></div>
                                                <span className="text-slate-700 font-medium">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                        <Info className="h-4 w-4 mt-0.5 text-primary-600" />
                        <span>Indian foods only: {weeklyPlanData.indian_foods_only ? 'Yes' : 'No'}</span>
                    </div>
                    {weeklyPlanData.precautions.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800 mb-2">Precautions</h3>
                            <ul className="space-y-2">
                                {weeklyPlanData.precautions.map((item, index) => (
                                    <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary-500 mt-2"></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className="text-xs text-slate-500 border-t border-slate-100 pt-4">
                        {weeklyPlanData.disclaimer}
                    </div>
                </div>
            </div>
        );
    }

    return <>{content}</>;
};
