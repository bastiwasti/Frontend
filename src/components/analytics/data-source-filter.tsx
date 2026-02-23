'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { Run, DateRange } from '@/types';

interface DataSourceFilterProps {
  dataSource: 'all' | 'run';
  onDataSourceChange: (value: 'all' | 'run') => void;
  selectedRunId: number | null;
  onRunIdChange: (value: number | null) => void;
  runs: Run[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export function DataSourceFilter({
  dataSource,
  onDataSourceChange,
  selectedRunId,
  onRunIdChange,
  runs,
  dateRange,
  onDateRangeChange,
}: DataSourceFilterProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Data Source Filter</CardTitle>
        <CardDescription>Select which data to analyze</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant={dataSource === 'all' ? 'default' : 'outline'}
              onClick={() => onDataSourceChange('all')}
              className={dataSource === 'all' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              ALL EVENTS
            </Button>
            <span className="text-gray-400">or</span>
            <div className="flex items-center gap-2">
              <Button
                variant={dataSource === 'run' ? 'default' : 'outline'}
                onClick={() => onDataSourceChange('run')}
                className={dataSource === 'run' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                Select Run ID
              </Button>
              {dataSource === 'run' && (
                <Select
                  value={selectedRunId?.toString() || ''}
                  onValueChange={(v) => onRunIdChange(v ? parseInt(v) : null)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Choose run" />
                  </SelectTrigger>
                  <SelectContent>
                    {runs.map(run => (
                      <SelectItem key={run.id} value={run.id.toString()}>
                        Run {run.id} - {run.agent}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>{format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}</>
                  ) : (
                    format(dateRange.from, 'MMM d, yyyy')
                  )
                ) : (
                  <span>Pick date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => onDateRangeChange(range || { from: undefined })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
}
