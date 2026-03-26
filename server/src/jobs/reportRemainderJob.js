import cron from "node-cron";
import Event from "../models/Event.js";
import activity from "../models/Activity.js";
import { sendEmail } from "../utils/emailService.js";

cron.schedule("0 10 * * *", async () => {

  console.log("Running report reminder job...");

  const today = new Date();

  const pastEvents = await Event.find({
    endDate: { $lt: today }
  }).populate("registrations.faculty");

  for (const event of pastEvents) {

    for (const reg of event.registrations) {

      const faculty = reg.faculty;

      const activity = await Report.findOne({
        faculty: faculty._id,
        event: event._id
      });

      if (!activity) {

        const subject = `Reminder: Submit Report for ${event.title}`;

        const html = `
<div style="font-family: Arial; padding:20px">

<h2 style="color:#4c1d95;">Actify Report Submission Reminder</h2>

<p>Dear ${faculty.name},</p>

<p>You attended the following event:</p>

<ul>
<li><b>Event:</b> ${event.title}</li>
<li><b>Date:</b> ${new Date(event.startDate).toDateString()}</li>
</ul>

<p>Please submit your activity report in the Actify portal.</p>

<p style="margin-top:15px">
Submitting your report helps maintain accurate faculty activity records.
</p>

<hr/>

<p style="color:#7c3aed;font-weight:bold">
Actify System
</p>

</div>
`;

        await sendEmail(faculty.email, subject, html);
      }
    }
  }

});