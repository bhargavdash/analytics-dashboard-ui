import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { TablePayload } from '../../../types';

type TableWidgetProps = {
    payload: TablePayload;
}

export const TableWidget = ({ payload }: TableWidgetProps) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    {payload.columns.map((col) => (
                        <TableHead key={col.key}>{col.label}</TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {payload.data.map((row, i) => (
                    <TableRow key={i}>
                        {payload.columns.map((col) => (
                            <TableCell
                                key={col.key}
                                className={typeof row[col.key] === 'number' ? 'tabular-nums' : ''}
                            >
                                {row[col.key] ?? '—'}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
