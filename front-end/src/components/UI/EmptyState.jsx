import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBagIcon } from '@heroicons/react/24/outline'

const EmptyState = ({ 
  title = 'Không có dữ liệu', 
  description = 'Hiện tại không có dữ liệu để hiển thị',
  actionLabel = 'Quay lại',
  actionLink = '/',
  action,
  icon: Icon = ShoppingBagIcon
}) => {
  // Check if icon is a JSX element or a component
  const renderIcon = () => {
    if (React.isValidElement(Icon)) {
      // If icon is a JSX element, render it directly
      return Icon
    }
    // If icon is a component, render it as a component
    return <Icon className="h-10 w-10 text-gray-400" />
  }

  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
        {renderIcon()}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">{description}</p>
      {action ? (
        action
      ) : actionLink ? (
        <Link
          to={actionLink}
          className="btn btn-primary inline-flex items-center"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}

export default EmptyState

