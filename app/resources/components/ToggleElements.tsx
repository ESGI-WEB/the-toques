import * as React from 'react';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

export interface Filter {
    label: string;
    name: string;
}

interface ToggleProps {
    title: string;
    filters?: Filter[];
    onToggleChange: (name: string, checked: boolean) => void;
}

export default function ToggleElements({ title, filters = [], onToggleChange }: ToggleProps) {
    const initialState = filters.reduce((acc: Record<string, boolean>, filter) => {
        acc[filter.name] = false;
        return acc;
    }, {});

    const [state, setState] = React.useState(initialState);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        setState((prevState) => ({
            ...prevState,
            [name]: checked,
        }));
        onToggleChange(name, checked);
    };

    return (
        <FormControl component="fieldset" variant="standard">
            <FormLabel component="legend">{title}</FormLabel>
            <FormGroup>
                {filters.map((filter) => (
                    <FormControlLabel
                        key={filter.name}
                        control={
                            <Switch checked={state[filter.name]} onChange={handleChange} name={filter.name} />
                        }
                        label={filter.label}
                    />
                ))}
            </FormGroup>
        </FormControl>
    );
}