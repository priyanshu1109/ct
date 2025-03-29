"use client"

import type React from "react"

import { useRef, useState } from "react"
import styles from "./travel-form.module.css"

interface FormData {
  username: string
  email: string
  mobile: string
  sourceCity: string
  destinationCity: string
  visaApproved: boolean
  startDate: string
  endDate: string
  landPackage: boolean
  flightPackage: boolean
  hotelPackage: boolean
  activities: { [key: string]: string }
  files: {
    land: { [key: string]: File[] }
    flight: { [key: string]: File[] }
    hotel: { [key: string]: File[] }
  }
}

export default function TravelForm() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    mobile: "",
    sourceCity: "",
    destinationCity: "",
    visaApproved: false,
    startDate: "",
    endDate: "",
    landPackage: false,
    flightPackage: false,
    hotelPackage: false,
    activities: {},
    files: {
      land: {},
      flight: {},
      hotel: {},
    },
    
  })

  const [numDays, setNumDays] = useState(0)
  const [dayFields, setDayFields] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, dateType: "startDate" | "endDate") => {
    const date = e.target.value
    setFormData((prev) => {
      const newData = { ...prev, [dateType]: date }
      if (newData.startDate && newData.endDate) {
        const start = new Date(newData.startDate)
        const end = new Date(newData.endDate)
        const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1
        setNumDays(days)
        setDayFields(Array.from({ length: days }, (_, i) => i + 1))
      }
      return newData
    })
  }

  const handleActivityChange = (e: React.ChangeEvent<HTMLInputElement>, day: number) => {
    const { value } = e.target
    setFormData((prev) => ({
      ...prev,
      activities: { ...prev.activities, [`${day}`]: value },
    }))
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    packageType: "land" | "flight" | "hotel",
    day: number,
  ) => {
    const file = e.target.files ? Array.from(e.target.files) : []
    setFormData((prev) => {
      // Create a copy of the current files for this package type and day
      const updatedFiles = { ...prev.files }

      // Initialize the array for this day if it doesn't exist
      if (!updatedFiles[packageType][`day${day}`]) {
        updatedFiles[packageType][`day${day}`] = []
      }

      // Add the new files to the array
      updatedFiles[packageType][`day${day}`] = file

      return {
        ...prev,
        files: updatedFiles,
      }
    })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitMessage("")

    const formDataToSend = new FormData()

    // Append all text and boolean fields
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "activities" && key !== "files") {
        formDataToSend.append(key, value.toString())
      }
    })

    // Append activities
    const activities_list:any = {}
    Object.entries(formData.activities).forEach(([key, value]) => {
      activities_list[`${key}`]=value
      console.log(activities_list)
      
    })
    formDataToSend.append(`activities`, JSON.stringify(activities_list))
    // Append files
    Object.entries(formData.files).forEach(([packageType, dayFiles]) => {
      Object.entries(dayFiles).forEach(([day, files]) => {
        files.forEach((file, index) => {
          formDataToSend.append(`files[${packageType}][${day}]`, file)
        })
      })
    })

    console.log(formDataToSend)

    try {
      const response = await fetch(process.env.REACT_APP_API_URL+"trip_details", {
        method: "POST",
        body: formDataToSend,
        
      })

      if (response.ok) {
        setSubmitMessage("Your trip has been booked successfully!")
      } else {
        setSubmitMessage("There was an error booking your trip. Please try again.")
      }
    } catch (error) {
      setSubmitMessage("There was an error submitting the form. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    
    <div className={styles.container}>
      
      <div className={styles.videoSection}>
        <video autoPlay loop muted playsInline className={styles.video}>
          <source src="/travel.mp4" type="video/mp4" />
        </video>
        
      </div>
      <div className={styles.formSection}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Fill Customer Details</h2>
          </div>
          <div className={styles.cardContent}>
            <form>
              <div className={styles.formRow}>
                <div className={styles.formCol}>
                  <div className={styles.formGroup}>
                    <label htmlFor="username" className={styles.formLabel}>
                      Full Name
                    </label>
                    <input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={styles.formInput}
                    />
                  </div>
                </div>
                <div className={styles.formCol}>
                  <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.formLabel}>
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={styles.formInput}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formCol}>
                  <div className={styles.formGroup}>
                    <label htmlFor="mobile" className={styles.formLabel}>
                      Mobile
                    </label>
                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className={styles.formInput}
                    />
                  </div>
                </div>
                <div className={styles.formCol}>
                  <div className={styles.formGroup}>
                    <label htmlFor="sourceCity" className={styles.formLabel}>
                      Departure City
                    </label>
                    <input
                      id="sourceCity"
                      name="sourceCity"
                      value={formData.sourceCity}
                      onChange={handleInputChange}
                      className={styles.formInput}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="destinationCity" className={styles.formLabel}>
                  Destination
                </label>
                <input
                  id="destinationCity"
                  name="destinationCity"
                  value={formData.destinationCity}
                  onChange={handleInputChange}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <div className={styles.switchContainer}>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={formData.visaApproved}
                      onChange={() => setFormData((prev) => ({ ...prev, visaApproved: !prev.visaApproved }))}
                    />
                    <span className={styles.slider}></span>
                  </label>
                  <span className={styles.formLabel}>Visa Approved</span>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formCol}>
                  <div className={styles.formGroup}>
                    <label htmlFor="startDate" className={styles.formLabel}>
                      Departure Date
                    </label>
                    <input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleDateChange(e, "startDate")}
                      className={styles.formInput}
                    />
                  </div>
                </div>
                <div className={styles.formCol}>
                  <div className={styles.formGroup}>
                    <label htmlFor="endDate" className={styles.formLabel}>
                      Return Date
                    </label>
                    <input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleDateChange(e, "endDate")}
                      className={styles.formInput}
                    />
                  </div>
                </div>
              </div>
              {dayFields.map((day) => (
                <div key={day} className={styles.formGroup}>
                  <label htmlFor={`day${day}`} className={styles.formLabel}>
                    Day {day} Activities
                  </label>
                  <input
                    id={`day${day}`}
                    name={`day${day}`}
                    value={formData.activities[`${day}`] || ""}
                    onChange={(e) => handleActivityChange(e, day)}
                    placeholder={`Activities for Day ${day}`}
                    className={styles.formInput}
                  />
                </div>
              ))}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Package Options</label>
                <div className={styles.checkboxGroup}>
                  <div className={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      id="landPackage"
                      name="landPackage"
                      checked={formData.landPackage}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="landPackage">Land Package</label>
                  </div>
                  <div className={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      id="flightPackage"
                      name="flightPackage"
                      checked={formData.flightPackage}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="flightPackage">Flight Package</label>
                  </div>
                  <div className={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      id="hotelPackage"
                      name="hotelPackage"
                      checked={formData.hotelPackage}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="hotelPackage">Hotel Package</label>
                  </div>
                </div>
              </div>
              {formData.landPackage && <FileUploadSection packageType="land" numDays={numDays} handleFileChange={handleFileChange}
                  fileInputRefs={fileInputRefs}/>}
              {formData.flightPackage && <FileUploadSection packageType="flight" numDays={numDays} handleFileChange={handleFileChange}
                  fileInputRefs={fileInputRefs}/>}
              {formData.hotelPackage && <FileUploadSection packageType="hotel" numDays={numDays} handleFileChange={handleFileChange}
                  fileInputRefs={fileInputRefs}/>}
            </form>
          </div>
          <div className={styles.cardFooter}>
            <button className={styles.button} onClick={handleSubmit}>Save Details</button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface FileUploadSectionProps {
  packageType: "land" | "flight" | "hotel"
  numDays: number
  handleFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    packageType: "land" | "flight" | "hotel",
    day: number,
  ) => void
  fileInputRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>
}
function FileUploadSection({ packageType, numDays, handleFileChange, fileInputRefs }: FileUploadSectionProps) {
  return (
    <div className={styles.formGroup}>
      <h3 className={styles.formLabel}>{packageType.charAt(0).toUpperCase() + packageType.slice(1)} Package Upload</h3>
      {Array.from({ length: numDays }, (_, i) => i + 1).map((day) => (
        <div key={`${packageType}-${day}`} className={styles.fileUpload}>
          <label htmlFor={`${packageType}_day${day}`} className={styles.fileLabel}>
            Day {day}:
          </label>
          <input
            type="file"
            id={`${packageType}_day${day}`}
            onChange={(e) => handleFileChange(e, packageType, day)}
            className={styles.fileInput}
            ref={(el) => {
              fileInputRefs.current[`${packageType}_day${day}`] = el;
            }}
            multiple
          />
        </div>
      ))}
    </div>
  )
}



