import { Link } from 'react-router-dom';

const EmptyState = ({ icon: Icon, title, description, actionText, actionLink }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-5 text-brand-600 border border-emerald-200 shadow-sm">
      <Icon className="text-3xl sm:text-4xl" />
    </div>
    <h3 className="text-lg sm:text-xl font-bold text-surface-900 mb-2 font-display">{title}</h3>
    <p className="text-xs sm:text-sm text-surface-500 max-w-sm mb-6 leading-relaxed font-medium">{description}</p>
    {actionLink && (
      <Link to={actionLink} className="btn-saas-primary text-xs !py-3 !px-6 shadow-sm font-bold">
        {actionText}
      </Link>
    )}
  </div>
);

export default EmptyState;
