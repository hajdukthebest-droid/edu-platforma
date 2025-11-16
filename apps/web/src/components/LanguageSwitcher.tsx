'use client'

import { useI18n } from '@/contexts/I18nContext'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Globe } from 'lucide-react'

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-gray-600" />
      <Select value={locale} onValueChange={(value: 'hr' | 'en') => setLocale(value)}>
        <SelectTrigger className="w-[100px] h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="hr">
            <div className="flex items-center gap-2">
              <span>🇭🇷</span>
              <span>Hrvatski</span>
            </div>
          </SelectItem>
          <SelectItem value="en">
            <div className="flex items-center gap-2">
              <span>🇬🇧</span>
              <span>English</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
