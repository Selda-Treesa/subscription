import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface AutomationFlow {
  key: string;
  title: string;
  description: string;
  enabled: boolean;
}

export const useAutomationFlows = () => {
  const [flows, setFlows] = useState<AutomationFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFlows = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('automation_flows')
      .select('key, title, description, enabled')
      .order('key');
    if (fetchError) {
      setError('Could not load automation flows. Please try again.');
    } else {
      setFlows((data ?? []) as AutomationFlow[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFlows();
  }, [loadFlows]);

  const setFlowEnabled = useCallback(async (key: string, enabled: boolean) => {
    const previous = flows;
    setFlows((prev) => prev.map((f) => (f.key === key ? { ...f, enabled } : f)));
    const { error: updateError } = await supabase
      .from('automation_flows')
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq('key', key);
    if (updateError) {
      setFlows(previous);
      setError('That change could not be saved. Please try again.');
    } else {
      setError(null);
    }
  }, [flows]);

  return { flows, loading, error, setFlowEnabled };
};
