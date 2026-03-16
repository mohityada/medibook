import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    onRate?: (rating: number) => void;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
    count?: number;
}

const sizeMap = { sm: 'h-3.5 w-3.5', md: 'h-5 w-5', lg: 'h-6 w-6' };

const StarRating = ({ rating, onRate, size = 'md', showValue = false, count }: StarRatingProps) => {
    return (
        <div className="flex items-center gap-1">
            <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onRate?.(star)}
                        disabled={!onRate}
                        className={`${onRate ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
                    >
                        <Star
                            className={`${sizeMap[size]} ${
                                star <= rating
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-gray-300'
                            }`}
                        />
                    </button>
                ))}
            </div>
            {showValue && (
                <span className="text-sm text-gray-600 ml-1">
                    {rating > 0 ? rating.toFixed(1) : '0'}
                    {count !== undefined && <span className="text-gray-400 ml-0.5">({count})</span>}
                </span>
            )}
        </div>
    );
};

export default StarRating;
