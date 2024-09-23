import { ReactNode } from 'react'

interface FooterProps {
	children: ReactNode;
}

const Footer: React.FC<FooterProps> = ({ children }) => {
  return (
	<div>{children}</div>
  )
}

export default Footer