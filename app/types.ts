// app/types.ts - Tüm Type Tanımlamaları

export interface DesignSettings {
  theme: string
  titleFont: string
  titleSize: number
  messageFont: string
  messageSize: number
}

export interface DetailBlock {
  id: string
  type: 'timeline' | 'note' | 'link'
  title?: string
  content?: string
  subContent?: string
  imageUrl?: string
  emoji?: string
}

export interface FormField {
  id: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'emoji'
  options?: string
  required: boolean
  emoji?: string
}

export interface Event {
  id: string
  slug: string
  title: string
  event_date: string | null
  location_name: string | null
  location_url: string | null
  message: string | null
  image_url: string | null
  main_image_url: string | null
  design_settings: DesignSettings | null
  custom_form_schema: FormField[] | null
  event_details: DetailBlock[] | null
  invite_template: string | null
  user_id: string
  created_at: string
}

export interface Guest {
  id: string
  event_id: string
  name: string
  email: string
  phone: string | null
  status: 'yes' | 'maybe' | 'no' | 'bekleniyor'
  participants: number
  note: string | null
  invite_method: 'email' | 'whatsapp' | 'sms'
  form_responses: Record<string, any> | null
  created_at: string
}

export interface Photo {
  id: string
  event_id: string
  user_email: string
  uploader_name: string
  image_url: string
  created_at: string
  photo_comments: PhotoComment[]
  photo_likes: PhotoLike[]
}

export interface PhotoComment {
  id: string
  photo_id: string
  user_email: string
  content: string
  created_at: string
}

export interface PhotoLike {
  id: string
  photo_id: string
  user_email: string
}

export interface Profile {
  id: string
  credits: number
  created_at: string
}

export interface CreditPackage {
  id: string
  package_name: string
  credits_amount: number
  etsy_link: string
  etsy_listing_id: string
  created_at: string
}

export interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export interface RsvpFormData {
  name: string
  email: string
  status: 'yes' | 'maybe' | 'no'
  plusOne: number
  note: string
  formResponses: Record<string, any>
}