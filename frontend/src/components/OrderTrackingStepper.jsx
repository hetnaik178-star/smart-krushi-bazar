import { FaCheck, FaBox, FaTruck, FaHome, FaTimes, FaClock } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const OrderTrackingStepper = ({ order }) => {
  const { t } = useLanguage();

  if (!order) return null;

  const isCancelled = order.trackingStatus === 'CANCELLED' || order.status === 'Cancelled' || order.status === 'Rejected';

  if (isCancelled) {
    return (
      <div className="p-3.5 rounded-2xl bg-red-50/80 border border-red-200 text-red-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-bold">
          <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]">
            <FaTimes />
          </div>
          <span>{t('orders.cancelled', 'Order Cancelled / Rejected')}</span>
        </div>
        <span className="text-[10px] text-red-600 font-medium">Refund or return logged</span>
      </div>
    );
  }

  // Define steps
  const steps = [
    {
      key: 'ORDER_PLACED',
      label: t('orders.orderPlaced', 'Order Placed'),
      icon: FaClock,
      date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : null
    },
    {
      key: 'HARVEST_PACKED',
      label: t('orders.harvestPacked', 'Harvest Packed'),
      icon: FaBox,
      date: order.packedAt ? new Date(order.packedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : null
    },
    {
      key: 'DISPATCHED',
      label: t('orders.dispatched', 'Dispatched'),
      icon: FaTruck,
      date: order.dispatchedAt ? new Date(order.dispatchedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : null
    },
    {
      key: 'DELIVERED',
      label: t('orders.delivered', 'Delivered'),
      icon: FaHome,
      date: order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : (order.status === 'Completed' ? 'Delivered' : null)
    }
  ];

  // Determine current active step index (0 to 3)
  const getActiveStepIndex = () => {
    const ts = order.trackingStatus || (order.status === 'Completed' ? 'DELIVERED' : (order.status === 'Accepted' ? 'HARVEST_PACKED' : 'ORDER_PLACED'));
    switch (ts) {
      case 'DELIVERED': return 3;
      case 'DISPATCHED': return 2;
      case 'HARVEST_PACKED': return 1;
      case 'ORDER_PLACED':
      default: return 0;
    }
  };

  const activeIndex = getActiveStepIndex();

  return (
    <div className="w-full py-2">
      <div className="relative flex items-center justify-between">
        {/* Continuous background track */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-surface-200 rounded-full z-0" />
        
        {/* Active progress fill */}
        <div 
          className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-gradient-to-r from-brand-600 via-emerald-500 to-teal-500 rounded-full z-0 transition-all duration-500"
          style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const isPending = idx > activeIndex;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center group">
              {/* Step Circle Node */}
              <div 
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
                    : isCurrent
                    ? 'bg-gradient-to-tr from-brand-700 to-emerald-500 text-white ring-4 ring-emerald-200/80 shadow-lg scale-110'
                    : 'bg-white text-surface-400 border-2 border-surface-200'
                }`}
              >
                {isDone ? (
                  <FaCheck className="text-[10px] sm:text-xs" />
                ) : (
                  <StepIcon className="text-[10px] sm:text-xs" />
                )}
              </div>

              {/* Step Label */}
              <div className="absolute top-full mt-1.5 flex flex-col items-center text-center whitespace-nowrap">
                <span className={`text-[10px] sm:text-[11px] font-extrabold ${
                  isCurrent 
                    ? 'text-brand-900 font-black' 
                    : isDone 
                    ? 'text-surface-700' 
                    : 'text-surface-400'
                }`}>
                  {step.label}
                </span>
                {step.date && (
                  <span className="text-[9px] text-surface-400 font-medium">
                    {step.date}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Spacer for bottom labels */}
      <div className="h-8" />
    </div>
  );
};

export default OrderTrackingStepper;
