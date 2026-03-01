import PDFDocument from 'pdfkit';
import { Response } from 'express';

interface DietPlanData {
  name: string;
  calories_per_day: number;
  veg_or_nonveg: string;
  weekly_plan: {
    [key: string]: {
      breakfast: string[];
      mid_morning: string[];
      lunch: string[];
      evening_snack: string[];
      dinner: string[];
    };
  };
  precautions: string[];
  disclaimer: string;
}

export const generateDietPDF = (data: DietPlanData, res: Response) => {
  try {
    const doc = new PDFDocument({ margin: 50 });

    // Set headers for file download
    const fileName = `DietPlan_${data.name.replace(/\s+/g, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Pipe to response
    doc.pipe(res);

    // Handle stream errors
    doc.on('error', (err) => {
      console.error('PDF generation stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'PDF generation failed' });
      }
    });

  // Title
  doc.fontSize(24).font('Helvetica-Bold').text('MediDiet – Weekly Diet Plan', { align: 'center' });
  doc.fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
  doc.moveDown(0.5);

  // User Info
  doc.fontSize(11).font('Helvetica-Bold').text('Diet Plan Details');
  doc.fontSize(10).font('Helvetica');
  doc.text(`User: ${data.name}`);
  doc.text(`Calories per day: ${data.calories_per_day} kcal`);
  doc.text(`Type: ${data.veg_or_nonveg}`);
  doc.moveDown(1);

  // Days - 7 day plan
  const dayOrder = ['day_1', 'day_2', 'day_3', 'day_4', 'day_5', 'day_6', 'day_7'];
  const mealOrder = ['breakfast', 'mid_morning', 'lunch', 'evening_snack', 'dinner'];
  const mealLabels: { [key: string]: string } = {
    breakfast: 'Breakfast',
    mid_morning: 'Mid Morning',
    lunch: 'Lunch',
    evening_snack: 'Evening Snack',
    dinner: 'Dinner',
  };

  dayOrder.forEach((dayKey, index) => {
    const dayNum = index + 1;
    const dayData = data.weekly_plan[dayKey];

    if (!dayData) return;

    // Day heading
    doc.fontSize(14).font('Helvetica-Bold').text(`DAY ${dayNum}`, { underline: true });
    doc.moveDown(0.3);

    // Meals for this day
    mealOrder.forEach((mealKey) => {
      const mealLabel = mealLabels[mealKey];
      const items = dayData[mealKey] || [];

      if (items.length > 0) {
        doc.fontSize(10).font('Helvetica-Bold').text(`${mealLabel}:`);
        items.forEach((item) => {
          doc.fontSize(9).font('Helvetica').text(`  • ${item}`);
        });
        doc.moveDown(0.2);
      }
    });

    doc.moveDown(0.5);

    // Check if we need a page break
    if (dayNum < 7 && doc.y > 700) {
      doc.addPage();
    }
  });

  // Precautions section
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica-Bold').text('Precautions', { underline: true });
  doc.moveDown(0.3);
  if (data.precautions && data.precautions.length > 0) {
    data.precautions.forEach((precaution) => {
      doc.fontSize(9).font('Helvetica').text(`  • ${precaution}`);
    });
  } else {
    doc.fontSize(9).font('Helvetica').text('No specific precautions.');
  }

  // Disclaimer section
  doc.moveDown(1);
  doc.fontSize(12).font('Helvetica-Bold').text('Disclaimer', { underline: true });
  doc.moveDown(0.3);
  doc.fontSize(8).font('Helvetica').text(data.disclaimer || 'N/A', { align: 'justify' });

  // Footer
  doc.moveDown(1);
  doc.fillColor('#666').fontSize(7).font('Helvetica').text('This meal plan is for informational purposes only. Please consult with a healthcare professional for personalized advice.', {
    align: 'center',
  });

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to generate PDF' });
    } else {
      // If headers already sent, just end the response
      res.end();
    }
  }
};
