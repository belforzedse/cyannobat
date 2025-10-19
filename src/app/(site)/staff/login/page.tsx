import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const LegacyStaffLoginPage = () => {
  redirect('/login')
}

export default LegacyStaffLoginPage

