import React, { useState } from 'react';
import { useStatusPrototype, STATUS_PROTOTYPES, StatusPrototypeId } from '@/shared/utils/statusBadge';
import { cn } from '@/shared/utils/cn';
import { Palette, ChevronDown, ChevronUp, Check } from 'lucide-react';

export const StatusPrototypeSelector: React.FC = () => {
  const { activeId, setPrototype } = useStatusPrototype();
  const [isExpanded, setIsExpanded] = useState(true);

  const statuses = ['Draft', 'Sent', 'Paid'];

  return (
    <div className="mb-6 bg-surface border border-accent/30 rounded-xl p-4 sm:p-5 shadow-xs transition-all">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-accent/15 text-accent">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              Status Color Scheme Prototype Selector
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-semibold uppercase tracking-wider">
                Temporary Preview
              </span>
            </h3>
            <p className="text-xs text-text-muted">
              Select a prototype below to test live color schemes across your invoices in real-time.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg text-text-muted hover:bg-muted hover:text-text-primary transition-colors text-xs flex items-center gap-1 font-semibold"
          title={isExpanded ? 'Collapse switcher' : 'Expand switcher'}
        >
          <span>{isExpanded ? 'Hide Options' : 'Show Options'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-border/60">
          {(Object.keys(STATUS_PROTOTYPES) as StatusPrototypeId[]).map((protoId) => {
            const proto = STATUS_PROTOTYPES[protoId];
            const isActive = activeId === protoId;

            return (
              <button
                key={protoId}
                type="button"
                onClick={() => setPrototype(protoId)}
                className={cn(
                  'flex flex-col justify-between p-3 rounded-lg border text-left transition-all cursor-pointer relative',
                  isActive
                    ? 'border-accent bg-accent/5 ring-2 ring-accent/30 shadow-xs'
                    : 'border-border bg-background/50 hover:border-accent/40 hover:bg-surface'
                )}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-xs font-bold text-text-primary truncate">
                    {proto.shortLabel}
                  </span>
                  {isActive && (
                    <span className="w-4 h-4 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                {/* 1x3 Grid Preview for Draft, Sent, Paid */}
                <div className="grid grid-cols-3 gap-1 w-full my-1.5">
                  {statuses.map((st) => (
                    <span
                      key={st}
                      className={cn(
                        'text-[9px] font-bold uppercase tracking-wider px-1 py-1 rounded text-center truncate select-none',
                        proto.styles[st]
                      )}
                    >
                      {st}
                    </span>
                  ))}
                </div>

                <p className="text-[10px] text-text-muted mt-1 leading-tight line-clamp-2">
                  {proto.description}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
