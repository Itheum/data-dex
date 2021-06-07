obj = {
  "lastName": "User",
  "firstName": "DexDemo",
  "programsAllocation": [
    {
      "program": "ef62c220-50e1-11e7-9bd2-2f33680a66b6",
      "status": "stop",
      "shortId": "1"
    },
    {
      "program": "bc9ce3e0-8f00-11e7-b1ff-9fef83fc8a42",
      "status": "stop",
      "shortId": "1"
    },
    {
      "program": "2553c3b0-51b0-11e7-9bd2-2f33680a66b6",
      "status": "stop",
      "shortId": "1"
    },
    {
      "program": "183f0290-f726-11e7-9186-3bcb5c5d22db",
      "status": "stop",
      "shortId": "1"
    },
    {
      "program": "70dc6bd0-59b0-11e8-8d54-2d562f6cba54",
      "status": "complete",
      "shortId": "1"
    },
    {
      "program": "476ab840-1cb7-11e9-84fe-e935b365220a",
      "status": "active",
      "shortId": "1"
    },
    {
      "program": "48d7b020-eab0-11ea-a466-0334ff0e8bf2",
      "status": "active",
      "shortId": "104"
    }
  ],
  "_lookups": {
    "programs": {
      "bc9ce3e0-8f00-11e7-b1ff-9fef83fc8a42": {
        "programName": "Hypertension Insights Intense",
        "description": "This Intense program aims to produce some blood pressure insights for our patient base. These insights can then be used to test some Hypothesis relating to the “Dangers of Morning Blood Pressure”, \"Unusual trends in Arm to Arm BP difference\" as well is the treatment plan a Patient on really controlling their Blood Pressure. \n\nAt the end of the Program the Patent will receive a report by post which we will recommend then take to their GP or Specialist. ",
        "duration": "2_weeks"
      },
      "476ab840-1cb7-11e9-84fe-e935b365220a": {
        "programName": "Blood Pressure OnDemand",
        "description": "A program for users to log and check blood pressure as they feel.",
        "duration": "ongoing"
      },
      "2553c3b0-51b0-11e7-9bd2-2f33680a66b6": {
        "programName": "Pregnancy Condition Monitoring",
        "description": "New Hypertension occurs in 8-10% of pregnancies and many women develop depression during this period.",
        "duration": "30_weeks"
      },
      "70dc6bd0-59b0-11e8-8d54-2d562f6cba54": {
        "programName": "Red Heart Challenge",
        "description": "A 3 week challenge to generate some Heart Health insights by collecting Blood Pressure readings, Stress Readings etc",
        "duration": "3_weeks"
      },
      "183f0290-f726-11e7-9186-3bcb5c5d22db": {
        "programName": "Chronic Wounds Healing Progress Tracker",
        "description": "Chronic Wounds Healing Progress Tracker",
        "duration": "4_weeks"
      },
      "ef62c220-50e1-11e7-9bd2-2f33680a66b6": {
        "programName": "Blood Pressure Tracker",
        "description": "Hypertension is defined as a systolic blood pressure of 140 mm Hg or more, or a diastolic blood pressure of 90 mm Hg or more, or taking antihypertensive medication. It is estimated that 1 in 3 people globally supper from Hypertension.\n\nThis Program is to help anyone living with Hypertension or Mild Hypertension to better manger their condition with proactive monitoring and tracking. It's also designed to help anyone track and monitor their loved ones living with this condition as well.",
        "duration": "ongoing"
      },
      "48d7b020-eab0-11ea-a466-0334ff0e8bf2": {
        "programName": "OkPulse",
        "description": "We would like to understand how we can best support you as you work remotely. This program provides us with a living pulse on your motivation, productivity, engagement levels and general health and wellbeing.",
        "duration": "ongoing"
      }
    }
  }
}

var encoded = btoa(encodeURIComponent(JSON.stringify(obj)))

var actual = JSON.parse(decodeURIComponent((atob(encoded))))