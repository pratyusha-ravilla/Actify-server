

// server/src/controllers/activityController.js
import fs from "fs";
import path from "path";
import Activity from "../models/Activity.js";
import puppeteer from "puppeteer";

import { Document, Packer, Paragraph, ImageRun } from "docx";
import { fileURLToPath } from "url";


// Fix dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PATHS
const TEMPLATE_PATH = path.join(__dirname, "..", "..", "templates", "report_template.html");
const CSS_PATH = path.join(__dirname, "..", "..", "templates", "report_template.css");
const HEADER_PATH = path.join(__dirname, "..", "..", "templates/images/header.png");
// point to server/src/uploads
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

// MAKE SURE uploads dir exists (safe-guard)
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ============================
// HELPERS
// ============================

// Base64 for header & static images
function toBase64(filePath) {
  try {
    if (!filePath || !fs.existsSync(filePath)) return "";
    const buf = fs.readFileSync(filePath);
    const ext = path.extname(filePath).substring(1) || "png";
    return `data:image/${ext};base64,${buf.toString("base64")}`;
  } catch (err) {
    console.log("BASE64 ERR:", err);
    return "";
  }
}


function toDataUrl(relativePath) {
  if (!relativePath) return "";

  try {
    const filename = path.basename(relativePath);
    const fullPath = path.join(UPLOADS_DIR, filename);

    if (!fs.existsSync(fullPath)) {
      console.log("❌ Attendance image NOT found:", fullPath);
      return "";
    }

    const buffer = fs.readFileSync(fullPath);
    const ext = path.extname(fullPath).slice(1).toLowerCase();

    if (!["jpg", "jpeg", "png", "webp"].includes(ext)) {
      console.log("❌ Not an image file:", filename);
      return "";
    }

    return `data:image/${ext};base64,${buffer.toString("base64")}`;
  } catch (err) {
    console.log("toDataUrl ERROR:", err.message);
    return "";
  }
}



// Load HTML template
function loadTemplate() {
  return fs.readFileSync(TEMPLATE_PATH, "utf8");
}

// ============================
// CREATE ACTIVITY
// ============================
export const createActivity = async (req, res) => {
  try {
    const payload = req.body.payload ? JSON.parse(req.body.payload) : {};

    // ensure resource person & session objects exist
    payload.resourcePerson = payload.resourcePerson || {};
    payload.sessionReport = payload.sessionReport || {};

    // Files (store relative paths like "uploads/filename")
    if (req.files?.invitation) payload.invitation = "uploads/" + req.files.invitation[0].filename;
    if (req.files?.poster) payload.poster = "uploads/" + req.files.poster[0].filename;
    if (req.files?.resourcePhoto) payload.resourcePerson.photo = "uploads/" + req.files.resourcePhoto[0].filename;
    if (req.files?.attendanceFile) payload.attendanceFile = "uploads/" + req.files.attendanceFile[0].filename;

    // NEW: attendanceImages (multiple)
    if (req.files?.attendanceImages) {
      payload.attendanceImages = req.files.attendanceImages.map(f => "uploads/" + f.filename);
    }

    // existing photos
    if (req.files?.photos) payload.photos = req.files.photos.map(f => "uploads/" + f.filename);

    //feedback
if (req.files?.feedbackImages) {
  payload.feedbackImages = req.files.feedbackImages.map(
    f => "uploads/" + f.filename);
}


    // set createdBy server-side (requires auth middleware)
    if (req.user && req.user._id) payload.createdBy = req.user._id;

    const activity = await Activity.create(payload);
    res.status(201).json(activity);

  } catch (err) {
    console.log("CREATE ERROR:", err);
    res.status(500).json({ message: "Create failed", error: err.message });
  }
  console.log("FILES RECEIVED:", Object.keys(req.files || {}));

};

// ============================
// GET ONE ACTIVITY
// ============================
export const getActivity = async (req, res) => {
  try {
    const a = await Activity.findById(req.params.id).populate("createdBy", "name email");
    if (!a) return res.status(404).json({ message: "Not found" });
    res.json(a);
  } catch (err) {
    console.log("GET ACTIVITY ERR:", err);
    res.status(500).json({ message: "Fetch failed" });
  }
};

// ============================
// UPDATE ACTIVITY
// ============================
export const updateActivity = async (req, res) => {
  try {
    const payload = req.body.payload ? JSON.parse(req.body.payload) : {};
    payload.resourcePerson = payload.resourcePerson || {};

    if (req.files?.invitation) payload.invitation = "uploads/" + req.files.invitation[0].filename;
    if (req.files?.poster) payload.poster = "uploads/" + req.files.poster[0].filename;
    if (req.files?.resourcePhoto) payload.resourcePerson.photo = "uploads/" + req.files.resourcePhoto[0].filename;
    if (req.files?.attendanceFile) payload.attendanceFile = "uploads/" + req.files.attendanceFile[0].filename;

    // NEW: attendanceImages (multiple)
    if (req.files?.attendanceImages) {
      payload.attendanceImages = req.files.attendanceImages.map(f => "uploads/" + f.filename);
    }

    if (req.files?.photos) payload.photos = req.files.photos.map(f => "uploads/" + f.filename);


if (req.files?.feedbackImages) {
  const newImages = req.files.feedbackImages.map(
    f => "uploads/" + f.filename
  );

  payload.feedbackImages = newImages;
}

    const updated = await Activity.findByIdAndUpdate(req.params.id, payload, { new: true });
    res.json(updated);

  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
  console.log("FILES RECEIVED:", Object.keys(req.files || {}));
console.log("FEEDBACK FILES:", req.files?.feedbackImages);
};


// ============================
// GENERATE PDF
// ============================
export const getPdf = async (req, res) => {
  try {
    const a = await Activity.findById(req.params.id).lean();
    if (!a) return res.status(404).json({ message: "Not found" });

    // debug: show which files controller sees
    console.log(
      "Generating PDF for activity:",
      a._id,
      "invitation:",
      a.invitation,
      "poster:",
      a.poster,
      "resourcePhoto:",
      a.resourcePerson?.photo,
      "attendanceFile:",
      a.attendanceFile,
      "attendanceImages:",
      a.attendanceImages || null
    );

    let html = loadTemplate();

    // Insert CSS path (puppeteer addStyleTag uses CSS_PATH)
    html = html.replace(/{{cssPath}}/g, CSS_PATH.replace(/\\/g, "/"));

    // Insert header image (inline base64)
    html = html.replace(/{{headerImage}}/g, toBase64(HEADER_PATH));

    // Titles map
    const titleMap = {
      conducted: "ACTIVITY CONDUCTED REPORT",
      attended: "ACTIVITY ATTENDED REPORT",
      expert_talk: "ACTIVITY EXPERT TALK"
    };

    // Basic text replacements
    html = html.replace(/{{reportTitle}}/g, titleMap[a.reportType] || "");
    html = html.replace(/{{academicYear}}/g, a.academicYear || "");
    html = html.replace(/{{activityName}}/g, a.activityName || "");
    html = html.replace(/{{coordinator}}/g, a.coordinator || "");
    html = html.replace(/{{date}}/g, a.date || "");
    html = html.replace(/{{duration}}/g, a.duration || "");
    html = html.replace(/{{poPos}}/g, a.poPos || "");

    html = html.replace(/{{resourceName}}/g, a.resourcePerson?.name || "");
    html = html.replace(/{{resourceDesignation}}/g, a.resourcePerson?.designation || "");
    html = html.replace(/{{resourceInstitution}}/g, a.resourcePerson?.institution || "");
    html = html.replace(/{{resourcePhoto}}/g, toDataUrl(a.resourcePerson?.photo));

    html = html.replace(/{{participants}}/g, (a.sessionReport?.participantsCount ?? a.sessionReport?.participants ?? "") + "");
    html = html.replace(/{{facultyCount}}/g, (a.sessionReport?.facultyCount ?? "") + "");
    html = html.replace(/{{feedback}}/g, a.feedback || "");


  
    // Invitation / poster images
    
    html = html.replace(/{{invitationImage}}/g, toDataUrl(a.invitation));
    html = html.replace(/{{posterImage}}/g, toDataUrl(a.poster));

  // ----------------------------
// PHOTOS PAGE (2 images per page - vertical)
// ----------------------------
let photoPagesHtml = "";

const photosArr = Array.isArray(a.photos) ? a.photos : [];

for (let i = 0; i < photosArr.length; i += 2) {
  const img1 = toDataUrl(photosArr[i]);
  const img2 = photosArr[i + 1] ? toDataUrl(photosArr[i + 1]) : "";


  photoPagesHtml += `
    <div class="photo-page">
      <div class="photo-box">
        ${img1 ? `<img src="${img1}" />` : ""}
      </div>

     ${img2 ? `
<div class="photo-box">
  <img src="${img2}" />
</div>
` : ""}
    </div>
    
  `;
}

html = html.replace(/{{photoPages}}/g, photoPagesHtml);

// =============================
// ATTENDANCE: ONE IMAGE PER PAGE
// =============================
let attendancePagesHtml = "";

const attendanceImages = Array.isArray(a.attendanceImages)
  ? a.attendanceImages
  : [];

attendanceImages.forEach((imgPath) => {
  const imgData = toDataUrl(imgPath);
  if (!imgData) return;

  attendancePagesHtml += `
    <div class="attendance-page">
      <div class="attendance-box">
        <img src="${imgData}" />
      </div>
    </div>
   
  `;
});

html = html.replace(/{{attendancePages}}/g, attendancePagesHtml);


// =============================
// FEEDBACK PAGE (2 IMAGES PER PAGE)
// =============================
let feedbackPagesHtml = "";

const feedbackArr = Array.isArray(a.feedbackImages) ? a.feedbackImages : [];

for (let i = 0; i < feedbackArr.length; i += 2) {
  const img1 = toDataUrl(feedbackArr[i]);
  const img2 = feedbackArr[i + 1] ? toDataUrl(feedbackArr[i + 1]) : "";

  feedbackPagesHtml += `
    <div class="feedback-page">
      <div class="feedback-box">
        ${img1 ? `<img src="${img1}" />` : ""}
      </div>

      ${img2 ? `
<div class="feedback-box">
  <img src="${img2}" />
</div>
` : ""}
    </div>
  `;
}

html = html.replace(/{{feedbackPages}}/g, feedbackPagesHtml);

  // ----------------------------
    // NEW: Session report specific placeholders (from sessionReport object)
    // ----------------------------
    const sr = a.sessionReport || {};

    // session name — fallback to activityName
    const sessionName = sr.sessionName || sr.session_name || a.activityName || "";
    html = html.replace(/{{sessionName}}/g, sessionName);

    // coordinators may be array or string, fallback to a.coordinator if missing
    let coordinators = "";
    if (Array.isArray(sr.coordinators)) {
      coordinators = sr.coordinators.join(", ");
    } else {
      coordinators = sr.coordinators || sr.coordinatorsText || a.coordinator || "";
    }
    html = html.replace(/{{coordinators}}/g, coordinators);

    // google meet link (try multiple possible keys)
    html = html.replace(/{{googleMeetLink}}/g, sr.googleMeetLink || sr.google_meet_link || sr.meetLink || "");

    // intended participants (try multiple keys)
    html = html.replace(/{{intendedParticipants}}/g, sr.intendedParticipants || sr.intended_participants || sr.intended || "");

    // category of event (try multiple keys)
    html = html.replace(/{{categoryOfEvent}}/g, sr.categoryOfEvent || sr.category_of_event || sr.category || "");

    // date_display - prefer sessionReport.date then sessionDate then activity.date
    const dateDisplay = sr.date || sr.sessionDate || sr.session_date || a.date || "";
    html = html.replace(/{{date_display}}/g, dateDisplay);

    // ensure session summary is filled (prefer sr.summary)
    const summaryText = sr.summary || sr.details || a.sessionReport?.summary || a.summary || a.feedback || "";
    html = html.replace(/{{sessionSummary}}/g, summaryText);

    // ----------------------------
    // Create PDF with Puppeteer
    // ----------------------------
   
 const browser = await puppeteer.launch({
  headless: "new",
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
  ],
});



const page = await browser.newPage();

// ✅ Load HTML
await page.setContent(html, {
  waitUntil: "domcontentloaded",
});

// ✅ Apply CSS
await page.addStyleTag({ path: CSS_PATH });


// ✅ Generate PDF
const pdf = await page.pdf({
  format: "A4",
  printBackground: true,

  displayHeaderFooter: true,

  headerTemplate: `
    <div style="width:100%; text-align:center; margin-top:10px;">
      <img src="${toBase64(HEADER_PATH)}" style="width:90%; height:auto;" />
    </div>
  `,

  footerTemplate: `<div></div>`,

  margin: {
    top: "135px",
    bottom: "100px",
    left: "50px",
    right: "50px"
  }
});


    await browser.close();

   // ✅ Send response
res.setHeader(
  "Content-Disposition",
  `attachment; filename="${(a.activityName || "report").replace(/[^a-z0-9_\-\.]/gi, "_")}.pdf"`
);
res.setHeader("Content-Type", "application/pdf");

res.send(pdf);

  } catch (err) {
    console.log("PDF ERROR:", err);
    res.status(500).json({ message: "PDF failed", error: err.message });
  }
};



//docx approach
export const getDocx = async (req, res) => {
  try {
    const a = await Activity.findById(req.params.id).lean();
    if (!a) return res.status(404).json({ message: "Not found" });

    const titleMap = {
      conducted: "ACTIVITY CONDUCTED REPORT",
      attended: "ACTIVITY ATTENDED REPORT",
      expert_talk: "ACTIVITY EXPERT TALK"
    };

    const children = [];

    // Header
    if (fs.existsSync(HEADER_PATH)) {
      const buf = fs.readFileSync(HEADER_PATH);
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: buf,
              transformation: { width: 550, height: 80 }
            })
          ]
        })
      );
    }

    // Content
    children.push(new Paragraph(titleMap[a.reportType] || ""));
    children.push(new Paragraph(`Academic Year: ${a.academicYear || ""}`));
    children.push(new Paragraph(`Activity Name: ${a.activityName || ""}`));
    children.push(new Paragraph(`Coordinator: ${a.coordinator || ""}`));
    children.push(new Paragraph(`Date: ${a.date || ""}`));
    children.push(new Paragraph(`Duration: ${a.duration || ""}`));
    children.push(new Paragraph(`PO & POs: ${a.poPos || ""}`));

    // Embed images if present
    function embed(rel) {
      if (!rel) return null;
      const full = path.join(UPLOADS_DIR, path.basename(rel));
      if (!fs.existsSync(full)) return null;
      const buffer = fs.readFileSync(full);
      return new Paragraph({
        children: [
          new ImageRun({
            data: buffer,
            transformation: { width: 450, height: 280 }
          })
        ]
      });
    }

    const maybeInvite = embed(a.invitation);
    if (maybeInvite) children.push(maybeInvite);

    const maybePoster = embed(a.poster);
    if (maybePoster) children.push(maybePoster);

    const maybeResourcePhoto = embed(a.resourcePerson?.photo);
    if (maybeResourcePhoto) children.push(maybeResourcePhoto);

    (a.photos || []).forEach(p => {
      const m = embed(p);
      if (m) children.push(m);
    });

    // also embed attendance images if present
    (a.attendanceImages || []).forEach(p => {
      const m = embed(p);
      if (m) children.push(m);
    });

    children.push(new Paragraph("Feedback"));
    children.push(new Paragraph(a.feedback || ""));

    // Build DOCX
    const doc = new Document({
      sections: [
        {
          properties: {},
          children
        }
      ]
    });

    const buffer = await Packer.toBuffer(doc);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${(a.activityName || 'report').replace(/[^a-z0-9_\-\.]/gi,'_')}.docx"`);
    res.send(buffer);

  } catch (err) {
    console.log("DOCX ERROR:", err);
    res.status(500).json({ message: "DOCX failed", error: err.message });
  }
};

// ============================
// LIST / APPROVE / REJECT
// ============================
export const listActivities = async (req, res) => {
  const list = await Activity.find().populate("createdBy", "name email").sort({ createdAt: -1 });
  res.json(list);
};

export const approveActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
        approvedBy: req.user?._id || null,
        approvedAt: new Date()
      },
      { new: true }
    );

    if (!activity) return res.status(404).json({ message: "Activity not found" });

    res.json({ message: "Approved successfully", activity });
  } catch (err) {
    console.error("APPROVE ERROR:", err);
    res.status(500).json({ message: "Approval failed", error: err.message });
  }
};

export const rejectActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        rejectedBy: req.user?._id || null,
        rejectedAt: new Date()
      },
      { new: true }
    );

    if (!activity) return res.status(404).json({ message: "Activity not found" });

    res.json({ message: "Rejected successfully", activity });
  } catch (err) {
    console.error("REJECT ERROR:", err);
    res.status(500).json({ message: "Rejection failed", error: err.message });
  }
};


