import { useState } from 'react';
import Machine from '../../lib/Machine';

function useMachine(): [Machine, (machine: Machine) => void] {
    const [machineRef, setMachineRef] = useState<{
        current: Machine;
    }>({ current: new Machine() });

    const setMachine = (machine: Machine) => {
        setMachineRef({ current: machine });
    };

    return [machineRef.current, setMachine];
}

export default useMachine;
