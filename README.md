## MOTIVATION OF PROJECT AND PROBLEM STATEMENT:
In TATA Steel Bar Mill, the production of steel bars is carried out. For each heat, certain values such as size tolerance range and ovality limits are predefined to ensure quality control. Traditionally, sample checks are conducted at every 10th bar, and four critical dimensions top/bottom, side, shoulder1, and shoulder2 are measured.
These values are compared against the specified size tolerance range. Then maximum and minimum values among the four dimensions are identified, and their difference is calculated to determine ovality, which is then checked against the range.
-	If the measurements are within range, a green signal is shown.
- If not, a red signal is given, indicating that corrective action is needed.

Once a heat is completed, a report is manually prepared and sent to the concerned authority. To solve this, I developed a digital solution where:
-	All inspection data can be input digitally,
-	Real-time validation is performed automatically,
-	Visual feedback is given instantly, and
-	The final report is generated and emailed to the concerned authority all in one place, without manual paperwork.

<img width="368" height="148" alt="image" src="https://github.com/user-attachments/assets/9e1ab88e-ea10-4772-a0fd-4fbf633e0d94" />

## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```



