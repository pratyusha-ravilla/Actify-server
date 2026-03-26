

//server/src/jobs/eventRemainderJob.js

import cron from "node-cron";
import Event from "../models/Event.js";
import { sendEmail } from "../utils/emailService.js";

cron.schedule("0 9 * * *", async () => {
  console.log("Running event reminder job...");

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const events = await Event.find({
    startDate: {
      $gte: new Date(today.setHours(0,0,0,0)),
      $lte: new Date(tomorrow.setHours(23,59,59,999))
    }
  }).populate("registrations.faculty");

  for (const event of events) {

    for (const reg of event.registrations) {

      const faculty = reg.faculty;

      if (!faculty?.email) continue;

      const subject = `Reminder: Upcoming Event - ${event.title}`;

     
      const html = `
<div style="font-family: Arial; padding:20px">

<h2 style="color:#4c1d95;">Actify Event Reminder</h2>

<p>Dear ${faculty.name},</p>

<p>This is a reminder for your upcoming event:</p>

<ul>
<li><b>Event:</b> ${event.title}</li>
<li><b>Department:</b> ${event.department}</li>
<li><b>Date:</b> ${new Date(event.startDate).toDateString()}</li>
</ul>

<p>Please attend the event and submit your report afterwards.</p>

<hr/>

<p style="color:#7c3aed;font-weight:bold">
Actify System
</p>

</div>
`;

      await sendEmail(faculty.email, subject, html);
    }
  }

});