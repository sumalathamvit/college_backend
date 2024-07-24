import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import {
  ADULT_COURSE,
  CRM_COURSE_TYPE,
  LMS_PRE_REQ_COURSE_TYPE,
  SALT_ROUNDS,
  adultEnrollmentCheckSubStr,
  youthEnrollmentCheckSubStr,
} from './constant'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
const CryptoJS = require('crypto-js')

dotenv.config()
// dotenv.config({
//   path: `./${process.env.NODE_ENV}.env`,
// });

// Encryption
const secretKey = process.env.SECRETKEY
export const encrypt = (text) => {
  const cipherText = CryptoJS.AES.encrypt(text, secretKey).toString()
  return cipherText
}

// Decryption
export const decrypt = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, secretKey)
  const originalText = bytes.toString(CryptoJS.enc.Utf8)
  console.log('%ccommon.js line:29 object', 'color: #007acc;', originalText)
  return originalText
}

export const passwordEncrypt = async (password) => {
  const salt = bcrypt.genSaltSync(SALT_ROUNDS)
  const result = await bcrypt.hashSync(password, salt)
  return result
}

export const passwordCompare = async (password, hashPassword) => {
  return bcrypt.compareSync(password, hashPassword)
}

export const createToken = (user_id, email) => {
  return jwt.sign({ user_id, email }, 'XyskeiRKreomkwjwuU')
}

export const verifyToken = (token) => {
  return jwt.verify(token, 'XyskeiRKreomkwjwuU')
}

export const generateSixDigitNumber = () => {
  return Math.floor(100000 + Math.random() * 900000)
}

const transporter = nodemailer.createTransport({
  host: 'email-smtp.us-east-2.amazonaws.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
})

function sendEmail(to, subject, html) {
  const mailOptions = {
    from: 'noreply@mentalhealthfirstaid.org',
    to,
    subject,
    html,
  }
  console.log('%ccommon.js line:71 object', 'color: #007acc;', mailOptions)
  transporter.sendMail(mailOptions, function (error, info) {
    console.log('%ccommon.js line:74 error', 'color: #007acc;', error)
    if (error) {
      console.log(error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
}

export function sendEmailVerification(email, otp) {
  const otpArr = otp.toString().split('')
  otpArr.splice(3, 0, '-')
  const otpStr = otpArr.join('')

  const emailHtml = `<html><head><link href="https://fonts.googleapis.com/css2?family=Open+Sans&display=swap" rel="stylesheet"></head><body><p style="text-align:center;font-family:'Open Sans',sans-serif;font-size:16px">To continue your application as a Mental Health First Aid Instructor, please use the following one-time code:</p><h1 style="text-align:center;font-family:'Open Sans',sans-serif;font-size:64px;">${otpStr}</h1><p style="text-align:center;font-family:'Open Sans',sans-serif;font-size:16px">This code will be valid for 10 minutes.</p><p style="text-align:center;font-family:'Open Sans',sans-serif;font-size:16px">For assistance, contact <a href="mailto:MHFAApplications@TheNationalCouncil.org">MHFAApplications@TheNationalCouncil.org</a></p><p style="text-align:center;font-family:'Open Sans',sans-serif;font-size: 16px;">Thank you!</p></body></html>` // Your email HTML content
  sendEmail(email, 'Email Otp Verification', emailHtml)
}

export function sendInviteUser(email, inviteLink) {
  const emailHtml = ` <html><head><link href="https://fonts.googleapis.com/css2?family=Open+Sans&display=swap" rel="stylesheet"></head><body>
  <h4>Hello!</h4>
  <p>You’ve been invited to participate in a Mental Health First Aid (MHFA) Instructor Training course!</p>
  <p style="margin-top:20px">Please click the link below and complete your application. Once your application is completed, you will be prompted to complete or update your MHFA Connect profile. Once your profile is complete, you can access the course on MHFA Connect and begin your pre-work.</p>
  <p><a href=${inviteLink} style="background-color:  #ea4b22; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Accept Invite</a></p>
  <p style="margin-top:40px">Thank you for choosing to #BeTheDifference,</p>
  <p><b>The Mental Health First Aid team</b></p>
  </body></html>`
  sendEmail(email, 'Email for Instructor Assessment', emailHtml)
}

export function sendSupportEmail(email) {
  const emailHtml = ` <html><head><link href="https://fonts.googleapis.com/css2?family=Open+Sans&display=swap" rel="stylesheet"></head><body>
  <h4>Hello!</h4>
  <p>We have received your support Request!</p>
  <p style="margin-top:40px">Thank you #BeTheDifference,</p>
  <p><b>The Mental Health First Aid team</b></p>
  </body></html>`;
  sendEmail(email, "Support Confirmation Email", emailHtml);
}

const areArraysEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length) {
    return false
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false
    }
  }
  return true
}

export const getTotalMarks = (result) => {
  const assessment_score = result?.reduce((count, result) => {
    return result.isCorrect ? count + result?.question_points : count
  }, 0)
  return [assessment_score, result?.length]
}

export const getResult = (questions, answers) => {
  const results = []
  answers?.forEach((answer) => {
    const examAnswer = questions?.find(
      (_e) => _e?.question_id === answer?.question_id
    )
    if (examAnswer) {
      const isCorrect = areArraysEqual(
        answer?.answer.sort(),
        examAnswer?.answer.sort()
      )
      results.push({
        question_id: answer?.question_id,
        isCorrect,
        question_points: examAnswer?.question_points,
      })
    }
  })
  return results
}

const checkEnrollmentCRM = (courseName, type, status, courseType) => {
  const mappedCourse = CRM_COURSE_TYPE[courseType]

  if (mappedCourse?.includes(type)) return true;

  const enrollmentCheck =
    type === ADULT_COURSE
      ? adultEnrollmentCheckSubStr
      : youthEnrollmentCheckSubStr
  //check substring for crm course
  return enrollmentCheck.some(
    (course) =>
      courseName?.toLowerCase()?.includes(course.toLowerCase()) &&
      (!status || status === 'passed' || status === 'completed')
  )
}

const checkEnrollmentLMS = (
  courseName,
  type,
  status,
  courseId,
  allLmsCourses,
  fieldId
) => {
  const tempCourse = allLmsCourses?.courses?.find((_c) => _c?.id === courseId)

  const fieldValue = tempCourse?.customDataFieldValues?.find(
    (_custom) => _custom?.definition_id === fieldId?.id
  )

  const isFirtsPass =
    (status === 'passed' || status === 'completed') &&
    LMS_PRE_REQ_COURSE_TYPE.includes(fieldValue?.value) &&
    type?.includes(fieldValue?.value)

  if (isFirtsPass) return isFirtsPass

  const enrollmentCheck =
    type === ADULT_COURSE
      ? adultEnrollmentCheckSubStr
      : youthEnrollmentCheckSubStr

  //check substring for LMS course
  return enrollmentCheck.some((course) => {
    return (
      courseName?.toLowerCase()?.includes(course.toLowerCase()) &&
      (status === 'passed' || status === 'completed')
    )
  })
}

//check crm precheck
export const getCrmPassedCourses = (courseArrray, crmCourses) => {
  if(!crmCourses) return [];
  return courseArrray?.filter((_course) => {
    return crmCourses?.find((_c) => {
      const { altai_name, ncbh_firstaidercoursetype } =
        _c?.altai_evt_eventregistrationid
      return checkEnrollmentCRM(
        altai_name,
        _course?.name,
        false,
        ncbh_firstaidercoursetype
      ) // checking with crm course name
    })
  })
}

//check lms precheck
export const getLmsPassedCourses = (
  courseArrray,
  lmsCourses,
  allLmsCourses
) => {

  if(!lmsCourses?.length) return [];

  const fieldId = allLmsCourses?.customDataFieldDefintions.find(
    (_c) => _c?.label === 'do_not_modify:_first_aider_course_type'
  )

  return courseArrray?.filter((_course) => {
    return lmsCourses?.find((_c) => {
      return checkEnrollmentLMS(
        _c?.course_name,
        _course?.name,
        _c?.status,
        _c.course_id,
        allLmsCourses,
        fieldId
      ) // cheking courses with lms enrollment
    })
  })
}

export const getDateBeforeThreeYear = () => {
  const currentDate = new Date()
  currentDate.setFullYear(currentDate.getFullYear() - 3)
  const formattedDate = currentDate.toISOString().slice(0, 10)
  return formattedDate
}

export const handleLMSError = async (error, messages) => {
  if (error?.response?.data?.response_type === 'ERROR') {
    let err = error?.response?.data?.message
    if (
      error?.response?.data?.message ===
      'user already exists, you can try to invite them to this portal?'
    ) {
      err = 'User exists in another portal'
    }

    messages.push({
      message: err,
      isError: true,
      text: err,
    })

    return err
  } else {
    messages.push({
      message: error.message,
      isError: true,
      text: error.message,
    })
    return error.message
  }
}

export const mapGroupWithName = {
  764377: 'Instructor Candidates - Adult',
  764378: 'Instructor Candidates - Youth',
  764376: 'Instructor Candidates - General',
  770361: 'Alt SACF Instructor Candidates - General',
  517857: 'Instructor Candidates - Adult',
  517858: 'Instructor Candidates - Youth',
  514548: 'Instructor Candidates - General',
  620855: 'Alt SACF Instructor Candidates - General',
  544150: 'Instructor Candidates - Adult',
  544151: 'Instructor Candidates - Youth',
  462381: 'Instructor Candidates - General',
  619011: 'Alt SACF Instructor Candidates - General',
}

export const filterUserLogs = (
  startDate = null,
  endDate = null,
  limit = 100,
  userLogs
) => {
  let logs = userLogs?.user_log

  logs?.sort((a, b) => {
    // sort logs by desc of date
    const dateA = new Date(a?.log_date)
    const dateB = new Date(b?.log_date)
    return dateB - dateA
  })

  if (startDate && endDate) {
    // If both start_date and end_date are provided, filter logs based on date range
    const startDateTime = new Date(startDate)
    const endDateTime = new Date(endDate)

    logs = logs?.filter((log) => {
      // filter the date in between range
      const logDateTime = new Date(log.log_date)
      return logDateTime >= startDateTime && logDateTime <= endDateTime
    })
  }
  logs = logs?.slice(0, limit)
  const filteredLogs = {
    id: userLogs?.id,
    user_id: userLogs?.user_id,
    created_date: userLogs?.created_date,
    updated_date: userLogs?.updated_date,
    user_log: logs,
  }
  return filteredLogs
}
