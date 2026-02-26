
import React, { useState, useEffect } from 'react';

// Centralized Constants and Mappings
const ROLES = {
    ADMIN: 'Admin',
    OFFICER: 'Officer',
    CITIZEN: 'Citizen'
};

const TICKET_STATUSES = {
    ISSUED: 'ISSUED',
    REVIEWED: 'REVIEWED',
    APPEALED: 'APPEALED',
    PAID: 'PAID',
    REJECTED: 'REJECTED',
    RESOLVED: 'RESOLVED'
};

const PAYMENT_STATUSES = {
    PENDING: 'PENDING',
    PAID: 'PAID',
    OVERDUE: 'OVERDUE',
    REFUNDED: 'REFUNDED'
};

const STATUS_UI_MAP = {
    [TICKET_STATUSES.ISSUED]: { label: 'Issued', color: 'PENDING' },
    [TICKET_STATUSES.REVIEWED]: { label: 'Reviewed', color: 'PENDING' },
    [TICKET_STATUSES.APPEALED]: { label: 'Appealed', color: 'REJECTED' }, // Appealed often implies dispute, hence danger color for visibility
    [TICKET_STATUSES.PAID]: { label: 'Paid', color: 'PAID' },
    [TICKET_STATUSES.REJECTED]: { label: 'Rejected', color: 'REJECTED' },
    [TICKET_STATUSES.RESOLVED]: { label: 'Resolved', color: 'APPROVED' },

    [PAYMENT_STATUSES.PENDING]: { label: 'Pending', color: 'PENDING' },
    [PAYMENT_STATUSES.PAID]: { label: 'Paid', color: 'PAID' },
    [PAYMENT_STATUSES.OVERDUE]: { label: 'Overdue', color: 'OVERDUE' },
    [PAYMENT_STATUSES.REFUNDED]: { label: 'Refunded', color: 'INFO' }
};

// Dummy Data Generation
const generateId = () => Math.random().toString(36).substr(2, 9).toUpperCase();

const mockOfficers = [
    { id: generateId(), name: 'Officer John Doe', badgeId: 'OPD-101', email: 'john.doe@city.gov', phone: '555-0101', status: 'Active' },
    { id: generateId(), name: 'Officer Jane Smith', badgeId: 'OPD-102', email: 'jane.smith@city.gov', phone: '555-0102', status: 'Active' },
    { id: generateId(), name: 'Officer Mike Johnson', badgeId: 'OPD-103', email: 'mike.j@city.gov', phone: '555-0103', status: 'Active' },
    { id: generateId(), name: 'Officer Emily White', badgeId: 'OPD-104', email: 'emily.w@city.gov', phone: '555-0104', status: 'Inactive' },
    { id: generateId(), name: 'Officer David Brown', badgeId: 'OPD-105', email: 'david.b@city.gov', phone: '555-0105', status: 'Active' },
];

const mockVehicles = [
    { licensePlate: 'ABC-123', make: 'Toyota', model: 'Camry', color: 'Silver' },
    { licensePlate: 'XYZ-789', make: 'Honda', model: 'CRV', color: 'Blue' },
    { licensePlate: 'DEF-456', make: 'Ford', model: 'F-150', color: 'Black' },
    { licensePlate: 'GHI-012', make: 'BMW', model: 'X5', color: 'White' },
    { licensePlate: 'JKL-345', make: 'Nissan', model: 'Altima', color: 'Red' },
];

const mockViolations = [
    { id: generateId(), type: 'No Parking Zone', fineAmount: 75.00, code: 'VPK-001' },
    { id: generateId(), type: 'Expired Meter', fineAmount: 50.00, code: 'VMT-002' },
    { id: generateId(), type: 'Handicapped Space', fineAmount: 250.00, code: 'VHP-003' },
    { id: generateId(), type: 'Overtime Parking', fineAmount: 40.00, code: 'VOT-004' },
    { id: generateId(), type: 'Double Parking', fineAmount: 100.00, code: 'VDP-005' },
];

const generateTicket = (status, officer, index) => {
    const violation = mockViolations[Math.floor(Math.random() * mockViolations.length)];
    const vehicle = mockVehicles[Math.floor(Math.random() * mockVehicles.length)];
    const issueDate = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]; // last 30 days
    const dueDate = new Date(new Date(issueDate).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let auditLog = [
        { timestamp: new Date(issueDate).toLocaleString(), user: officer.name, action: `Ticket ${violation.code} issued.`, details: `Initial fine: $${violation.fineAmount.toFixed(2)}` }
    ];
    let paymentId = null;

    if (status === TICKET_STATUSES.PAID) {
        paymentId = generateId();
        auditLog = [...auditLog, { timestamp: new Date(new Date(dueDate).getTime() - 5 * 24 * 60 * 60 * 1000).toLocaleString(), user: 'Citizen', action: `Payment received.`, details: `Amount: $${violation.fineAmount.toFixed(2)}` }];
    } else if (status === TICKET_STATUSES.APPEALED) {
        auditLog = [...auditLog, { timestamp: new Date(new Date(issueDate).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleString(), user: 'Citizen', action: `Appeal initiated.`, details: `Reason: Incorrect vehicle identified.` }];
    } else if (status === TICKET_STATUSES.REJECTED) {
         auditLog = [...auditLog, { timestamp: new Date(new Date(issueDate).getTime() + 10 * 24 * 60 * 60 * 1000).toLocaleString(), user: 'Admin', action: `Ticket rejected.`, details: `Issue date missing.` }];
    } else if (status === TICKET_STATUSES.REVIEWED) {
        auditLog = [...auditLog, { timestamp: new Date(new Date(issueDate).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleString(), user: 'Admin', action: `Ticket reviewed.`, details: `Evidence confirmed.` }];
    } else if (status === TICKET_STATUSES.RESOLVED) {
        auditLog = [...auditLog, { timestamp: new Date(new Date(issueDate).getTime() + 20 * 24 * 60 * 60 * 1000).toLocaleString(), user: 'Admin', action: `Ticket resolved (warning issued).`, details: `No fine collected.` }];
    }

    return {
        id: `TKT-${1000 + index}`,
        violationId: violation.id,
        violationType: violation.type,
        fineAmount: violation.fineAmount,
        status: status,
        licensePlate: vehicle.licensePlate,
        vehicleMake: vehicle.make,
        vehicleModel: vehicle.model,
        vehicleColor: vehicle.color,
        officerId: officer.id,
        officerName: officer.name,
        location: `Main St & ${String.fromCharCode(65 + index)} Ave`,
        issueDate: issueDate,
        dueDate: dueDate,
        paymentId: paymentId,
        photos: [`/images/photo_${index + 1}.jpg`], // Dummy image paths
        notes: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. This is a note for ticket ${1000 + index}.`,
        auditLog: auditLog,
        workflow: [
            { stage: 'Issued', date: issueDate, status: 'completed' },
            { stage: 'Reviewed', date: status !== TICKET_STATUSES.ISSUED ? new Date(new Date(issueDate).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null, status: status === TICKET_STATUSES.ISSUED ? 'pending' : (status === TICKET_STATUSES.REVIEWED || status === TICKET_STATUSES.APPEALED || status === TICKET_STATUSES.PAID || status === TICKET_STATUSES.REJECTED || status === TICKET_STATUSES.RESOLVED ? 'completed' : 'pending') },
            { stage: 'Actioned', date: (status === TICKET_STATUSES.PAID || status === TICKET_STATUSES.APPEALED || status === TICKET_STATUSES.REJECTED || status === TICKET_STATUSES.RESOLVED) ? new Date(new Date(issueDate).getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null, status: (status === TICKET_STATUSES.PAID || status === TICKET_STATUSES.APPEALED || status === TICKET_STATUSES.REJECTED || status === TICKET_STATUSES.RESOLVED) ? 'completed' : 'pending' },
            { stage: 'Closed', date: (status === TICKET_STATUSES.PAID || status === TICKET_STATUSES.REJECTED || status === TICKET_STATUSES.RESOLVED) ? new Date(new Date(issueDate).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null, status: (status === TICKET_STATUSES.PAID || status === TICKET_STATUSES.REJECTED || status === TICKET_STATUSES.RESOLVED) ? 'completed' : 'pending' }
        ]
    };
};

const generatePayment = (ticket, index) => {
    const paymentDate = new Date(new Date(ticket.issueDate).getTime() + Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    const status = ticket.status === TICKET_STATUSES.PAID ? PAYMENT_STATUSES.PAID : (new Date() > new Date(ticket.dueDate) ? PAYMENT_STATUSES.OVERDUE : PAYMENT_STATUSES.PENDING);
    return {
        id: ticket.paymentId || `PMT-${2000 + index}`,
        ticketId: ticket.id,
        amount: ticket.fineAmount,
        status: status,
        paymentMethod: status === PAYMENT_STATUSES.PAID ? (index % 2 === 0 ? 'Credit Card' : 'Online Banking') : null,
        paymentDate: status === PAYMENT_STATUSES.PAID ? paymentDate : null,
        transactionId: status === PAYMENT_STATUSES.PAID ? `TRX-${generateId()}` : null,
        payerName: 'John Citizen',
        email: 'john.citizen@example.com'
    };
};

const dummyTickets = Array.from({ length: 10 }, (_, i) => {
    const officer = mockOfficers[i % mockOfficers.length];
    let status;
    if (i < 3) status = TICKET_STATUSES.ISSUED; // 3 Issued
    else if (i < 5) status = TICKET_STATUSES.REVIEWED; // 2 Reviewed
    else if (i < 6) status = TICKET_STATUSES.APPEALED; // 1 Appealed
    else if (i < 8) status = TICKET_STATUSES.PAID; // 2 Paid
    else if (i < 9) status = TICKET_STATUSES.REJECTED; // 1 Rejected
    else status = TICKET_STATUSES.RESOLVED; // 1 Resolved
    return generateTicket(status, officer, i);
});

const dummyPayments = dummyTickets.map((ticket, i) => generatePayment(ticket, i));


function App() {
    const [view, setView] = useState({ screen: 'DASHBOARD', params: {} });
    const [user, setUser] = useState({ id: 'admin1', name: 'System Admin', role: ROLES.ADMIN, avatar: 'SA' });
    const [tickets, setTickets] = useState(dummyTickets);
    const [payments, setPayments] = useState(dummyPayments);
    const [officers, setOfficers] = useState(mockOfficers);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterState, setFilterState] = useState({ status: 'ALL', officer: 'ALL' });
    const [sortState, setSortState] = useState({ key: 'issueDate', direction: 'desc' });

    // Global Navigation Handler
    const navigate = (screen, params = {}) => {
        setView({ screen, params });
    };

    // Handlers for global actions
    const handleLogout = () => {
        // Implement logout logic
        console.log('Logging out...');
        setUser(null); // Or redirect to login
        navigate('LOGIN'); // Dummy 'LOGIN' screen
    };

    const handleSearchChange = (e) => setSearchQuery(e.target.value);
    const handleFilterChange = (key, value) => setFilterState(prev => ({ ...prev, [key]: value }));
    const handleSortChange = (key) => {
        setSortState(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Data Filtering and Sorting Logic
    const getFilteredAndSortedTickets = () => {
        let filtered = tickets.filter(ticket =>
            (filterState.status === 'ALL' || ticket.status === filterState.status) &&
            (filterState.officer === 'ALL' || ticket.officerId === filterState.officer) &&
            (searchQuery === '' ||
             ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
             ticket.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
             ticket.officerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
             ticket.violationType.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        return [...filtered].sort((a, b) => {
            const valA = a?.[sortState.key];
            const valB = b?.[sortState.key];
            if (typeof valA === 'string') {
                return sortState.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            if (typeof valA === 'number') {
                return sortState.direction === 'asc' ? valA - valB : valB - valA;
            }
            // For dates
            if (valA && valB && !isNaN(new Date(valA)) && !isNaN(new Date(valB))) {
                const dateA = new Date(valA);
                const dateB = new Date(valB);
                return sortState.direction === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
            }
            return 0;
        });
    };

    const getFilteredAndSortedPayments = () => {
        // Similar filtering and sorting logic for payments
        return payments.filter(p =>
            (searchQuery === '' || p?.ticketId?.toLowerCase().includes(searchQuery.toLowerCase()) || p?.payerName?.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    };

    const getFilteredAndSortedOfficers = () => {
        // Similar filtering and sorting logic for officers
        return officers.filter(o =>
            (searchQuery === '' || o?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || o?.badgeId?.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    };

    const currentTickets = getFilteredAndSortedTickets();
    const currentPayments = getFilteredAndSortedPayments();
    const currentOfficers = getFilteredAndSortedOfficers();

    // Reusable UI Components (defined within App for brevity, would be separate files in a real app)

    const StatusBadge = ({ statusKey }) => {
        const statusInfo = STATUS_UI_MAP[statusKey] || { label: 'Unknown', color: 'gray' };
        return (
            <span className={`status-badge status-${statusInfo.color}`}>
                {statusInfo.label}
            </span>
        );
    };

    const Button = ({ children, onClick, variant = 'primary', icon, type = 'button', disabled = false }) => (
        <button
            type={type}
            onClick={onClick}
            className={`button button-${variant}`}
            disabled={disabled}
        >
            {icon && <span className="material-symbols-outlined icon">{icon}</span>}
            {children}
        </button>
    );

    const Header = () => (
        <header className="header">
            <div className="header-search">
                <span className="material-symbols-outlined icon">search</span>
                <input
                    type="text"
                    placeholder="Global Search (Tickets, Payments, Officers...)"
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </div>
            <div className="header-actions">
                <button title="Notifications">
                    <span className="material-symbols-outlined">notifications</span>
                </button>
                <button title="Settings">
                    <span className="material-symbols-outlined">settings</span>
                </button>
                <div className="user-profile" onClick={handleLogout}>
                    <div className="user-profile-avatar">{user?.avatar}</div>
                    <span className="user-profile-name">{user?.name}</span>
                </div>
            </div>
        </header>
    );

    const Sidebar = () => (
        <aside className="sidebar">
            <div>
                <h2 className="sidebar-header">Smart Parking</h2>
                <nav className="sidebar-nav">
                    <ul>
                        <li className="sidebar-nav-item">
                            <button onClick={() => navigate('DASHBOARD')} className={view.screen === 'DASHBOARD' ? 'active' : ''}>
                                <span className="material-symbols-outlined icon">dashboard</span>
                                <span className="label">Dashboard</span>
                            </button>
                        </li>
                        <li className="sidebar-nav-item">
                            <button onClick={() => navigate('TICKETS_LIST')} className={view.screen.startsWith('TICKET') ? 'active' : ''}>
                                <span className="material-symbols-outlined icon">receipt_long</span>
                                <span className="label">Tickets</span>
                            </button>
                        </li>
                        <li className="sidebar-nav-item">
                            <button onClick={() => navigate('PAYMENTS_LIST')} className={view.screen.startsWith('PAYMENT') ? 'active' : ''}>
                                <span className="material-symbols-outlined icon">payments</span>
                                <span className="label">Payments</span>
                            </button>
                        </li>
                        <li className="sidebar-nav-item">
                            <button onClick={() => navigate('OFFICERS_LIST')} className={view.screen.startsWith('OFFICER') ? 'active' : ''}>
                                <span className="material-symbols-outlined icon">badge</span>
                                <span className="label">Officers</span>
                            </button>
                        </li>
                        {/* More admin specific navigation */}
                        <li className="sidebar-nav-item">
                            <button onClick={() => navigate('SETTINGS')} className={view.screen === 'SETTINGS' ? 'active' : ''}>
                                <span className="material-symbols-outlined icon">admin_panel_settings</span>
                                <span className="label">Admin Settings</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
            {/* Could add a footer here like version info or help link */}
            <div className="sidebar-footer">
                <p style={{fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textAlign: 'center'}}>v1.0.0</p>
            </div>
        </aside>
    );

    const Breadcrumbs = ({ items }) => (
        <div className="breadcrumbs">
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && <span>/</span>}
                    {item.link ? (
                        <a href="#" onClick={() => navigate(item.link.screen, item.link.params)}>{item.label}</a>
                    ) : (
                        <span className="current-page">{item.label}</span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    // Screen Components

    const DashboardScreen = () => {
        const totalTickets = tickets.length;
        const paidTickets = tickets.filter(t => t.status === TICKET_STATUSES.PAID).length;
        const appealedTickets = tickets.filter(t => t.status === TICKET_STATUSES.APPEALED).length;
        const issuedTickets = tickets.filter(t => t.status === TICKET_STATUSES.ISSUED).length;
        const totalFines = tickets.reduce((sum, t) => sum + (t.fineAmount || 0), 0);
        const collectedFines = tickets.filter(t => t.status === TICKET_STATUSES.PAID).reduce((sum, t) => sum + (t.fineAmount || 0), 0);
        const complianceRate = totalTickets > 0 ? (paidTickets / totalTickets) * 100 : 0;

        const recentActivities = tickets.slice(0, 5).flatMap(ticket =>
            ticket.auditLog.map(log => ({
                ticketId: ticket.id,
                action: log.action,
                timestamp: log.timestamp,
                user: log.user
            }))
        ).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return (
            <>
                <div className="page-header">
                    <h1>Dashboard</h1>
                    <Breadcrumbs items={[{ label: 'Dashboard' }]} />
                </div>

                <div className="kpi-grid">
                    <div className="kpi-tile">
                        <div className="kpi-title"><span className="material-symbols-outlined icon">receipt_long</span>Tickets Issued</div>
                        <div className="kpi-value">{totalTickets}</div>
                        <div className="kpi-footer">
                            <span>Last 30 days</span>
                            <span className="kpi-trend positive"><span className="material-symbols-outlined icon">arrow_upward</span>12%</span>
                        </div>
                    </div>
                    <div className="kpi-tile">
                        <div className="kpi-title"><span className="material-symbols-outlined icon">payments</span>Fines Collected</div>
                        <div className="kpi-value">${collectedFines.toFixed(2)}</div>
                        <div className="kpi-footer">
                            <span>Total revenue</span>
                            <span className="kpi-trend positive"><span className="material-symbols-outlined icon">arrow_upward</span>8%</span>
                        </div>
                    </div>
                    <div className="kpi-tile">
                        <div className="kpi-title"><span className="material-symbols-outlined icon">gavel</span>Open Appeals</div>
                        <div className="kpi-value">{appealedTickets}</div>
                        <div className="kpi-footer">
                            <span>Pending review</span>
                            <span className="kpi-trend negative"><span className="material-symbols-outlined icon">arrow_downward</span>3%</span>
                        </div>
                    </div>
                    <div className="kpi-tile">
                        <div className="kpi-title"><span className="material-symbols-outlined icon">done_all</span>Compliance Rate</div>
                        <div className="kpi-value">{complianceRate.toFixed(1)}%</div>
                        <div className="kpi-footer">
                            <span>Tickets paid / total</span>
                            <span className="kpi-trend positive"><span className="material-symbols-outlined icon">arrow_upward</span>1.5%</span>
                        </div>
                    </div>
                </div>

                <div className="charts-grid">
                    <div className="glass-panel chart-panel">
                        <div className="chart-panel-header">
                            <h3>Violations by Type</h3>
                            <div className="chart-actions">
                                <Button variant="secondary" icon="download">Export</Button>
                            </div>
                        </div>
                        <div className="chart-placeholder">
                            <div className="chart-bar-example">
                                <div className="chart-bar" style={{ height: '70%' }}></div>
                                <div className="chart-bar" style={{ height: '40%' }}></div>
                                <div className="chart-bar" style={{ height: '90%' }}></div>
                                <div className="chart-bar" style={{ height: '60%' }}></div>
                                <div className="chart-bar" style={{ height: '75%' }}></div>
                            </div>
                        </div>
                        <div className="chart-footer" style={{textAlign: 'center', marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)'}}>
                            <span>No Parking Zone (70), Expired Meter (40), Handicapped (90)...</span>
                        </div>
                    </div>

                    <div className="glass-panel chart-panel">
                        <div className="chart-panel-header">
                            <h3>Revenue Over Time</h3>
                            <div className="chart-actions">
                                <Button variant="secondary" icon="download">Export</Button>
                            </div>
                        </div>
                        <div className="chart-placeholder">
                            <div className="chart-line-example"></div>
                        </div>
                        <div className="chart-footer" style={{textAlign: 'center', marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)'}}>
                            <span>Monthly revenue trends (Last 6 months)</span>
                        </div>
                    </div>

                    <div className="glass-panel chart-panel">
                        <div className="chart-panel-header">
                            <h3>Ticket Status Distribution</h3>
                            <div className="chart-actions">
                                <Button variant="secondary" icon="download">Export</Button>
                            </div>
                        </div>
                        <div className="chart-placeholder" style={{flexDirection: 'row', gap: 'var(--spacing-lg)'}}>
                            <div className="chart-donut-example"></div>
                            <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)'}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)'}}><span style={{width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-danger)'}}></span>Appealed ({appealedTickets})</div>
                                <div style={{display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)'}}><span style={{width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-pending)'}}></span>Issued/Reviewed ({issuedTickets + tickets.filter(t => t.status === TICKET_STATUSES.REVIEWED).length})</div>
                                <div style={{display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)'}}><span style={{width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-success)'}}></span>Paid/Resolved ({paidTickets + tickets.filter(t => t.status === TICKET_STATUSES.RESOLVED).length})</div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel chart-panel">
                        <div className="chart-panel-header">
                            <h3>Officer Performance (Compliance)</h3>
                            <div className="chart-actions">
                                <Button variant="secondary" icon="download">Export</Button>
                            </div>
                        </div>
                        <div className="chart-placeholder">
                            <div className="chart-gauge-example">
                                <div className="chart-gauge-fill" style={{transform: `rotate(${complianceRate * 1.8 - 90}deg)`}}></div> {/* 0 to 180 deg, -90 for start */}
                                <div className="chart-gauge-overlay"></div>
                                <div className="chart-gauge-label">{complianceRate.toFixed(0)}%</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-panel">
                    <div className="section-header">
                        <h2>Recent Activities</h2>
                        <Button variant="ghost" onClick={() => navigate('AUDIT_LOG')}>View All</Button>
                    </div>
                    <div className="data-list" style={{ boxShadow: 'none' }}> {/* Remove default shadow for embedded list */}
                        <div className="data-list-header">
                            <div className="data-list-col col-small">ID</div>
                            <div className="data-list-col col-wide">Activity</div>
                            <div className="data-list-col">User</div>
                            <div className="data-list-col col-medium text-right">Timestamp</div>
                        </div>
                        {recentActivities.slice(0, 5).map((activity, index) => (
                            <div key={index} className="data-list-item">
                                <div className="data-list-col col-small">{activity?.ticketId}</div>
                                <div className="data-list-col col-wide">{activity?.action}</div>
                                <div className="data-list-col">{activity?.user}</div>
                                <div className="data-list-col col-medium text-right">{activity?.timestamp}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        );
    };

    const TicketsListScreen = () => {
        // Dummy bulk actions
        const handleBulkDelete = () => alert('Bulk Delete action triggered!');
        const handleExport = () => alert('Export Tickets to PDF/Excel triggered!');

        return (
            <>
                <div className="page-header">
                    <h1>Tickets Management</h1>
                    <Breadcrumbs items={[{ label: 'Dashboard', link: { screen: 'DASHBOARD' } }, { label: 'Tickets' }]} />
                </div>

                <div className="glass-panel" style={{marginBottom: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-md)'}}>
                    <div className="flex-row justify-between mb-lg">
                        <div className="flex-row gap-md align-center">
                            <Button variant="primary" icon="add" onClick={() => navigate('CREATE_TICKET')}>Create New Ticket</Button>
                            <Button variant="secondary" icon="download" onClick={handleExport}>Export</Button>
                            <Button variant="danger" icon="delete" onClick={handleBulkDelete}>Bulk Delete</Button>
                        </div>
                        <div className="flex-row gap-md align-center">
                            <Button variant="ghost" icon="visibility">Saved Views</Button>
                            <Button variant="secondary" icon="filter_alt">Filters</Button>
                        </div>
                    </div>

                    <div className="flex-row gap-md" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                            <label htmlFor="filterStatus">Status</label>
                            <select
                                id="filterStatus"
                                value={filterState.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <option value="ALL">All Statuses</option>
                                {Object.values(TICKET_STATUSES).map(status => (
                                    <option key={status} value={status}>{STATUS_UI_MAP[status].label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                            <label htmlFor="filterOfficer">Officer</label>
                            <select
                                id="filterOfficer"
                                value={filterState.officer}
                                onChange={(e) => handleFilterChange('officer', e.target.value)}
                            >
                                <option value="ALL">All Officers</option>
                                {officers.map(officer => (
                                    <option key={officer.id} value={officer.id}>{officer.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="data-list" style={{ boxShadow: 'none', border: 'none', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
                        <div className="data-list-header" style={{backgroundColor: 'var(--color-surface-light)'}}>
                            <div className="data-list-col" style={{flex: '0 0 120px', cursor: 'pointer'}} onClick={() => handleSortChange('id')}>
                                Ticket ID {sortState.key === 'id' && (sortState.direction === 'asc' ? '▲' : '▼')}
                            </div>
                            <div className="data-list-col" style={{flex: '0 0 120px', cursor: 'pointer'}} onClick={() => handleSortChange('licensePlate')}>
                                License Plate {sortState.key === 'licensePlate' && (sortState.direction === 'asc' ? '▲' : '▼')}
                            </div>
                            <div className="data-list-col col-wide" style={{cursor: 'pointer'}} onClick={() => handleSortChange('violationType')}>
                                Violation Type {sortState.key === 'violationType' && (sortState.direction === 'asc' ? '▲' : '▼')}
                            </div>
                            <div className="data-list-col" style={{flex: '0 0 100px', cursor: 'pointer'}} onClick={() => handleSortChange('fineAmount')}>
                                Amount {sortState.key === 'fineAmount' && (sortState.direction === 'asc' ? '▲' : '▼')}
                            </div>
                            <div className="data-list-col" style={{flex: '0 0 120px', cursor: 'pointer'}} onClick={() => handleSortChange('issueDate')}>
                                Issue Date {sortState.key === 'issueDate' && (sortState.direction === 'asc' ? '▲' : '▼')}
                            </div>
                            <div className="data-list-col" style={{flex: '0 0 100px', cursor: 'pointer'}} onClick={() => handleSortChange('status')}>
                                Status {sortState.key === 'status' && (sortState.direction === 'asc' ? '▲' : '▼')}
                            </div>
                            <div className="data-list-col" style={{flex: '0 0 80px'}}>Actions</div>
                        </div>
                        {currentTickets.length === 0 ? (
                            <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                <p style={{fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)'}}>No tickets found matching your criteria.</p>
                                <Button variant="secondary" icon="refresh" onClick={() => {setSearchQuery(''); setFilterState({ status: 'ALL', officer: 'ALL' });}}>Clear Filters</Button>
                            </div>
                        ) : (
                            currentTickets.map(ticket => (
                                <TicketCard key={ticket.id} ticket={ticket} onClick={() => navigate('TICKET_DETAIL', { id: ticket.id })} />
                            ))
                        )}
                    </div>
                </div>
            </>
        );
    };

    const TicketCard = ({ ticket, onClick }) => (
        <div className="data-list-item card-hover-effect" onClick={onClick} style={{ cursor: 'pointer', transition: 'background-color 0.2s', backgroundColor: 'var(--color-surface)'}}>
            <div className="data-list-col" style={{flex: '0 0 120px', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)'}}>{ticket?.id}</div>
            <div className="data-list-col" style={{flex: '0 0 120px'}}>{ticket?.licensePlate}</div>
            <div className="data-list-col col-wide">{ticket?.violationType}</div>
            <div className="data-list-col" style={{flex: '0 0 100px'}}>${ticket?.fineAmount?.toFixed(2)}</div>
            <div className="data-list-col" style={{flex: '0 0 120px'}}>{ticket?.issueDate}</div>
            <div className="data-list-col" style={{flex: '0 0 100px'}}>
                <StatusBadge statusKey={ticket?.status} />
            </div>
            <div className="data-list-col" style={{flex: '0 0 80px'}}>
                <Button variant="ghost" icon="edit" onClick={(e) => { e.stopPropagation(); navigate('EDIT_TICKET', { id: ticket?.id }); }}>
                    {/* Edit */}
                </Button>
            </div>
        </div>
    );

    const TicketDetailScreen = () => {
        const ticket = tickets.find(t => t.id === view.params.id);

        if (!ticket) {
            return (
                <div className="main-content" style={{textAlign: 'center', padding: 'var(--spacing-xxl)'}}>
                    <h1 style={{color: 'var(--color-danger)'}}>Ticket Not Found</h1>
                    <p style={{marginTop: 'var(--spacing-md)', color: 'var(--color-text-secondary)'}}>The ticket with ID {view.params.id} does not exist.</p>
                    <Button variant="primary" icon="arrow_back" onClick={() => navigate('TICKETS_LIST')} style={{marginTop: 'var(--spacing-lg)'}}>Back to Tickets</Button>
                </div>
            );
        }

        const handleEdit = () => navigate('EDIT_TICKET', { id: ticket.id });
        const handleMarkPaid = () => {
            setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: TICKET_STATUSES.PAID, paymentId: `PMT-${generateId()}`, auditLog: [...t.auditLog, { timestamp: new Date().toLocaleString(), user: user.name, action: `Ticket manually marked as Paid.`, details: `Fine: $${t.fineAmount?.toFixed(2)}` }] } : t));
            navigate('TICKET_DETAIL', { id: ticket.id });
        };
        const handleDelete = () => {
            if (window.confirm(`Are you sure you want to delete ticket ${ticket.id}?`)) {
                setTickets(prev => prev.filter(t => t.id !== ticket.id));
                navigate('TICKETS_LIST');
            }
        };

        const currentStageIndex = ticket?.workflow?.findIndex(stage => stage.status === 'pending');
        const completedStages = currentStageIndex === -1 ? ticket?.workflow?.length : currentStageIndex;


        return (
            <>
                <div className="page-header">
                    <h1>Ticket Details: {ticket?.id}</h1>
                    <Breadcrumbs items={[
                        { label: 'Dashboard', link: { screen: 'DASHBOARD' } },
                        { label: 'Tickets', link: { screen: 'TICKETS_LIST' } },
                        { label: ticket?.id }
                    ]} />
                </div>

                <div className="glass-panel" style={{marginBottom: 'var(--spacing-xl)'}}>
                    <div className="flex-row justify-between align-center mb-lg">
                        <div className="flex-row align-center gap-md">
                            <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-text-primary)' }}>{ticket?.violationType}</h2>
                            <StatusBadge statusKey={ticket?.status} />
                        </div>
                        <div className="flex-row gap-md">
                            {user.role === ROLES.ADMIN && ticket?.status !== TICKET_STATUSES.PAID && (
                                <Button variant="primary" icon="payments" onClick={handleMarkPaid}>Mark as Paid</Button>
                            )}
                            {user.role === ROLES.ADMIN && (
                                <Button variant="secondary" icon="edit" onClick={handleEdit}>Edit</Button>
                            )}
                            {user.role === ROLES.ADMIN && (
                                <Button variant="danger" icon="delete" onClick={handleDelete}>Delete</Button>
                            )}
                        </div>
                    </div>

                    <div className="flex-row gap-xl" style={{marginBottom: 'var(--spacing-xl)'}}>
                        <div style={{flex: 1}}>
                            <h3 style={{fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--color-text-primary)'}}>Ticket Information</h3>
                            <div className="flex-col gap-sm" style={{color: 'var(--color-text-secondary)'}}>
                                <div className="flex-row justify-between"><span>License Plate:</span><span className="text-bold">{ticket?.licensePlate}</span></div>
                                <div className="flex-row justify-between"><span>Vehicle:</span><span>{ticket?.vehicleMake} {ticket?.vehicleModel} ({ticket?.vehicleColor})</span></div>
                                <div className="flex-row justify-between"><span>Fine Amount:</span><span className="text-bold">${ticket?.fineAmount?.toFixed(2)}</span></div>
                                <div className="flex-row justify-between"><span>Issue Date:</span><span>{ticket?.issueDate}</span></div>
                                <div className="flex-row justify-between"><span>Due Date:</span><span>{ticket?.dueDate}</span></div>
                                <div className="flex-row justify-between"><span>Issued By:</span><span>{ticket?.officerName} ({officers.find(o => o.id === ticket.officerId)?.badgeId})</span></div>
                                <div className="flex-row justify-between"><span>Location:</span><span>{ticket?.location}</span></div>
                            </div>
                        </div>
                        <div style={{flex: 1}}>
                            <h3 style={{fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--color-text-primary)'}}>Additional Details</h3>
                            <div className="flex-col gap-sm" style={{color: 'var(--color-text-secondary)'}}>
                                <div className="flex-row justify-between"><span>Ticket ID:</span><span className="text-bold">{ticket?.id}</span></div>
                                <div className="flex-row justify-between"><span>Violation Code:</span><span>{mockViolations.find(v => v.type === ticket?.violationType)?.code}</span></div>
                                <div className="flex-row justify-between"><span>Payment ID:</span><span className="text-bold">{ticket?.paymentId || 'N/A'}</span></div>
                                <div className="flex-row justify-between" style={{alignItems: 'flex-start'}}><span>Notes:</span><span style={{maxWidth: '60%', textAlign: 'right'}}>{ticket?.notes}</span></div>
                            </div>
                        </div>
                    </div>

                    <h3 style={{fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--color-text-primary)'}}>Workflow Progress</h3>
                    <div className="workflow-tracker">
                        {ticket?.workflow?.map((stage, index) => (
                            <div key={index} className="workflow-stage">
                                <div className={`stage-dot ${index < completedStages ? 'completed' : ''} ${stage.status === 'pending' ? 'current' : ''}`}></div>
                                <span className="stage-label">{stage?.stage}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel">
                    <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-primary)' }}>Related Information</h2>

                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-xl)'}}>
                        <div>
                            <h3 style={{fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--color-text-primary)'}}>Attachments ({ticket?.photos?.length || 0})</h3>
                            <div className="flex-col gap-md">
                                {ticket?.photos?.map((photo, index) => (
                                    <div key={index} className="flex-row align-center gap-md" style={{backgroundColor: 'var(--color-surface-light)', borderRadius: 'var(--border-radius-md)', padding: 'var(--spacing-sm)', border: '1px solid rgba(255,255,255,0.08)'}}>
                                        <span className="material-symbols-outlined" style={{fontSize: '2rem', color: 'var(--color-primary)'}}>image</span>
                                        <div className="flex-col">
                                            <span style={{fontWeight: 'var(--font-weight-medium)'}}>Evidence_Photo_{index + 1}.jpg</span>
                                            <span style={{fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)'}}>2.5 MB</span>
                                        </div>
                                        <Button variant="ghost" icon="visibility" style={{marginLeft: 'auto'}}>View</Button>
                                    </div>
                                ))}
                                {(!ticket?.photos || ticket?.photos.length === 0) && <p className="text-muted">No attachments available.</p>}
                            </div>
                        </div>

                        <div>
                            <h3 style={{fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--color-text-primary)'}}>Audit Log</h3>
                            <div className="data-list" style={{maxHeight: '300px', overflowY: 'auto'}}>
                                <div className="data-list-header">
                                    <div className="data-list-col col-small">Time</div>
                                    <div className="data-list-col">User</div>
                                    <div className="data-list-col col-wide">Action</div>
                                </div>
                                {ticket?.auditLog?.map((log, index) => (
                                    <div key={index} className="data-list-item">
                                        <div className="data-list-col col-small">{new Date(log?.timestamp).toLocaleTimeString()}</div>
                                        <div className="data-list-col">{log?.user}</div>
                                        <div className="data-list-col col-wide">{log?.action}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    const PaymentsListScreen = () => {
        // Dummy bulk actions
        const handleExport = () => alert('Export Payments to PDF/Excel triggered!');

        return (
            <>
                <div className="page-header">
                    <h1>Payments Management</h1>
                    <Breadcrumbs items={[{ label: 'Dashboard', link: { screen: 'DASHBOARD' } }, { label: 'Payments' }]} />
                </div>

                <div className="glass-panel" style={{marginBottom: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-md)'}}>
                    <div className="flex-row justify-between mb-lg">
                        <div className="flex-row gap-md align-center">
                            <Button variant="secondary" icon="download" onClick={handleExport}>Export</Button>
                        </div>
                        <div className="flex-row gap-md align-center">
                            <Button variant="ghost" icon="visibility">Saved Views</Button>
                            <Button variant="secondary" icon="filter_alt">Filters</Button>
                        </div>
                    </div>

                    <div className="data-list" style={{ boxShadow: 'none', border: 'none', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
                        <div className="data-list-header" style={{backgroundColor: 'var(--color-surface-light)'}}>
                            <div className="data-list-col" style={{flex: '0 0 120px'}}>Payment ID</div>
                            <div className="data-list-col" style={{flex: '0 0 120px'}}>Ticket ID</div>
                            <div className="data-list-col">Payer Name</div>
                            <div className="data-list-col" style={{flex: '0 0 100px'}}>Amount</div>
                            <div className="data-list-col" style={{flex: '0 0 120px'}}>Payment Date</div>
                            <div className="data-list-col" style={{flex: '0 0 120px'}}>Method</div>
                            <div className="data-list-col" style={{flex: '0 0 100px'}}>Status</div>
                            <div className="data-list-col" style={{flex: '0 0 80px'}}>Actions</div>
                        </div>
                        {currentPayments.length === 0 ? (
                             <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                <p style={{fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)'}}>No payments found matching your criteria.</p>
                                <Button variant="secondary" icon="refresh" onClick={() => {setSearchQuery(''); setFilterState({ status: 'ALL', officer: 'ALL' });}}>Clear Filters</Button>
                            </div>
                        ) : (
                            currentPayments.map(payment => (
                                <PaymentCard key={payment.id} payment={payment} onClick={() => navigate('PAYMENT_DETAIL', { id: payment.id })} />
                            ))
                        )}
                    </div>
                </div>
            </>
        );
    };

    const PaymentCard = ({ payment, onClick }) => (
        <div className="data-list-item card-hover-effect" onClick={onClick} style={{ cursor: 'pointer', transition: 'background-color 0.2s', backgroundColor: 'var(--color-surface)'}}>
            <div className="data-list-col" style={{flex: '0 0 120px', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)'}}>{payment?.id}</div>
            <div className="data-list-col" style={{flex: '0 0 120px'}}>{payment?.ticketId}</div>
            <div className="data-list-col">{payment?.payerName}</div>
            <div className="data-list-col" style={{flex: '0 0 100px'}}>${payment?.amount?.toFixed(2)}</div>
            <div className="data-list-col" style={{flex: '0 0 120px'}}>{payment?.paymentDate || 'N/A'}</div>
            <div className="data-list-col" style={{flex: '0 0 120px'}}>{payment?.paymentMethod || 'N/A'}</div>
            <div className="data-list-col" style={{flex: '0 0 100px'}}>
                <StatusBadge statusKey={payment?.status} />
            </div>
            <div className="data-list-col" style={{flex: '0 0 80px'}}>
                <Button variant="ghost" icon="info" onClick={(e) => { e.stopPropagation(); navigate('PAYMENT_DETAIL', { id: payment?.id }); }}>
                    {/* View */}
                </Button>
            </div>
        </div>
    );

    const PaymentDetailScreen = () => {
        const payment = payments.find(p => p.id === view.params.id);
        const associatedTicket = tickets.find(t => t.id === payment?.ticketId);

        if (!payment) {
            return (
                <div className="main-content" style={{textAlign: 'center', padding: 'var(--spacing-xxl)'}}>
                    <h1 style={{color: 'var(--color-danger)'}}>Payment Not Found</h1>
                    <p style={{marginTop: 'var(--spacing-md)', color: 'var(--color-text-secondary)'}}>The payment with ID {view.params.id} does not exist.</p>
                    <Button variant="primary" icon="arrow_back" onClick={() => navigate('PAYMENTS_LIST')} style={{marginTop: 'var(--spacing-lg)'}}>Back to Payments</Button>
                </div>
            );
        }

        return (
            <>
                <div className="page-header">
                    <h1>Payment Details: {payment?.id}</h1>
                    <Breadcrumbs items={[
                        { label: 'Dashboard', link: { screen: 'DASHBOARD' } },
                        { label: 'Payments', link: { screen: 'PAYMENTS_LIST' } },
                        { label: payment?.id }
                    ]} />
                </div>

                <div className="glass-panel" style={{marginBottom: 'var(--spacing-xl)'}}>
                    <div className="flex-row justify-between align-center mb-lg">
                        <div className="flex-row align-center gap-md">
                            <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-text-primary)' }}>Payment for Ticket {payment?.ticketId}</h2>
                            <StatusBadge statusKey={payment?.status} />
                        </div>
                        <div className="flex-row gap-md">
                            {user.role === ROLES.ADMIN && payment?.status === PAYMENT_STATUSES.PAID && (
                                <Button variant="secondary" icon="receipt_long" onClick={() => navigate('TICKET_DETAIL', { id: payment?.ticketId })}>View Ticket</Button>
                            )}
                            {user.role === ROLES.ADMIN && payment?.status === PAYMENT_STATUSES.PAID && (
                                <Button variant="secondary" icon="download">Generate Receipt</Button>
                            )}
                        </div>
                    </div>

                    <div className="flex-row gap-xl" style={{marginBottom: 'var(--spacing-xl)'}}>
                        <div style={{flex: 1}}>
                            <h3 style={{fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--color-text-primary)'}}>Payment Information</h3>
                            <div className="flex-col gap-sm" style={{color: 'var(--color-text-secondary)'}}>
                                <div className="flex-row justify-between"><span>Payment ID:</span><span className="text-bold">{payment?.id}</span></div>
                                <div className="flex-row justify-between"><span>Ticket ID:</span><span className="text-bold">{payment?.ticketId}</span></div>
                                <div className="flex-row justify-between"><span>Amount:</span><span className="text-bold">${payment?.amount?.toFixed(2)}</span></div>
                                <div className="flex-row justify-between"><span>Payment Date:</span><span>{payment?.paymentDate || 'N/A'}</span></div>
                                <div className="flex-row justify-between"><span>Payment Method:</span><span>{payment?.paymentMethod || 'N/A'}</span></div>
                                <div className="flex-row justify-between"><span>Transaction ID:</span><span>{payment?.transactionId || 'N/A'}</span></div>
                            </div>
                        </div>
                        <div style={{flex: 1}}>
                            <h3 style={{fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--color-text-primary)'}}>Payer Details</h3>
                            <div className="flex-col gap-sm" style={{color: 'var(--color-text-secondary)'}}>
                                <div className="flex-row justify-between"><span>Payer Name:</span><span className="text-bold">{payment?.payerName}</span></div>
                                <div className="flex-row justify-between"><span>Payer Email:</span><span>{payment?.email}</span></div>
                                {/* Additional payer info could go here */}
                            </div>
                        </div>
                    </div>

                    {associatedTicket && (
                        <div style={{marginTop: 'var(--spacing-xxl)'}}>
                            <h3 style={{fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--color-text-primary)'}}>Associated Ticket Details</h3>
                            <div className="card" onClick={() => navigate('TICKET_DETAIL', { id: associatedTicket.id })} style={{ padding: 'var(--spacing-md)', border: '1px dashed rgba(99,102,241,0.3)', boxShadow: 'var(--shadow-glass-sm)'}}>
                                <div className="card-header" style={{borderBottom: 'none', marginBottom: 'var(--spacing-xs)'}}>
                                    <h4 style={{fontSize: 'var(--font-size-base)'}}>Ticket {associatedTicket?.id} - {associatedTicket?.violationType}</h4>
                                    <StatusBadge statusKey={associatedTicket?.status} />
                                </div>
                                <div className="card-body" style={{fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-xs)'}}>
                                    <div className="card-item"><span className="card-item-label">License Plate:</span><span className="card-item-value">{associatedTicket?.licensePlate}</span></div>
                                    <div className="card-item"><span className="card-item-label">Fine Amount:</span><span className="card-item-value">${associatedTicket?.fineAmount?.toFixed(2)}</span></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </>
        );
    };

    const OfficersListScreen = () => {
        // Dummy bulk actions
        const handleExport = () => alert('Export Officers to PDF/Excel triggered!');
        return (
            <>
                <div className="page-header">
                    <h1>Officers Management</h1>
                    <Breadcrumbs items={[{ label: 'Dashboard', link: { screen: 'DASHBOARD' } }, { label: 'Officers' }]} />
                </div>

                <div className="glass-panel" style={{marginBottom: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-md)'}}>
                    <div className="flex-row justify-between mb-lg">
                        <div className="flex-row gap-md align-center">
                            <Button variant="primary" icon="add" onClick={() => navigate('CREATE_OFFICER')}>Add New Officer</Button>
                            <Button variant="secondary" icon="download" onClick={handleExport}>Export</Button>
                        </div>
                        <div className="flex-row gap-md align-center">
                            <Button variant="ghost" icon="visibility">Saved Views</Button>
                            <Button variant="secondary" icon="filter_alt">Filters</Button>
                        </div>
                    </div>

                    <div className="data-list" style={{ boxShadow: 'none', border: 'none', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
                        <div className="data-list-header" style={{backgroundColor: 'var(--color-surface-light)'}}>
                            <div className="data-list-col" style={{flex: '0 0 100px'}}>Badge ID</div>
                            <div className="data-list-col col-wide">Name</div>
                            <div className="data-list-col col-wide">Email</div>
                            <div className="data-list-col" style={{flex: '0 0 120px'}}>Phone</div>
                            <div className="data-list-col" style={{flex: '0 0 100px'}}>Status</div>
                            <div className="data-list-col" style={{flex: '0 0 80px'}}>Actions</div>
                        </div>
                        {currentOfficers.length === 0 ? (
                            <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                <p style={{fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)'}}>No officers found matching your criteria.</p>
                                <Button variant="secondary" icon="refresh" onClick={() => setSearchQuery('')}>Clear Search</Button>
                            </div>
                        ) : (
                            currentOfficers.map(officer => (
                                <OfficerCard key={officer.id} officer={officer} onClick={() => navigate('OFFICER_DETAIL', { id: officer.id })} />
                            ))
                        )}
                    </div>
                </div>
            </>
        );
    };

    const OfficerCard = ({ officer, onClick }) => (
        <div className="data-list-item card-hover-effect" onClick={onClick} style={{ cursor: 'pointer', transition: 'background-color 0.2s', backgroundColor: 'var(--color-surface)'}}>
            <div className="data-list-col" style={{flex: '0 0 100px', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)'}}>{officer?.badgeId}</div>
            <div className="data-list-col col-wide">{officer?.name}</div>
            <div className="data-list-col col-wide">{officer?.email}</div>
            <div className="data-list-col" style={{flex: '0 0 120px'}}>{officer?.phone}</div>
            <div className="data-list-col" style={{flex: '0 0 100px'}}>
                <StatusBadge statusKey={officer?.status === 'Active' ? TICKET_STATUSES.PAID : TICKET_STATUSES.REJECTED} /> {/* Reusing existing status for visual */}
            </div>
            <div className="data-list-col" style={{flex: '0 0 80px'}}>
                <Button variant="ghost" icon="edit" onClick={(e) => { e.stopPropagation(); navigate('EDIT_OFFICER', { id: officer?.id }); }}>
                    {/* Edit */}
                </Button>
            </div>
        </div>
    );

    const OfficerDetailScreen = () => {
        const officer = officers.find(o => o.id === view.params.id);

        if (!officer) {
            return (
                <div className="main-content" style={{textAlign: 'center', padding: 'var(--spacing-xxl)'}}>
                    <h1 style={{color: 'var(--color-danger)'}}>Officer Not Found</h1>
                    <p style={{marginTop: 'var(--spacing-md)', color: 'var(--color-text-secondary)'}}>The officer with ID {view.params.id} does not exist.</p>
                    <Button variant="primary" icon="arrow_back" onClick={() => navigate('OFFICERS_LIST')} style={{marginTop: 'var(--spacing-lg)'}}>Back to Officers</Button>
                </div>
            );
        }

        const handleEdit = () => navigate('EDIT_OFFICER', { id: officer.id });
        const handleDelete = () => {
            if (window.confirm(`Are you sure you want to delete officer ${officer.name}?`)) {
                setOfficers(prev => prev.filter(o => o.id !== officer.id));
                navigate('OFFICERS_LIST');
            }
        };

        const officerTickets = tickets.filter(t => t.officerId === officer.id);

        return (
            <>
                <div className="page-header">
                    <h1>Officer Details: {officer?.name}</h1>
                    <Breadcrumbs items={[
                        { label: 'Dashboard', link: { screen: 'DASHBOARD' } },
                        { label: 'Officers', link: { screen: 'OFFICERS_LIST' } },
                        { label: officer?.name }
                    ]} />
                </div>

                <div className="glass-panel" style={{marginBottom: 'var(--spacing-xl)'}}>
                    <div className="flex-row justify-between align-center mb-lg">
                        <div className="flex-row align-center gap-md">
                            <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-text-primary)' }}>{officer?.name} ({officer?.badgeId})</h2>
                            <StatusBadge statusKey={officer?.status === 'Active' ? TICKET_STATUSES.PAID : TICKET_STATUSES.REJECTED} />
                        </div>
                        <div className="flex-row gap-md">
                            {user.role === ROLES.ADMIN && (
                                <Button variant="secondary" icon="edit" onClick={handleEdit}>Edit</Button>
                            )}
                            {user.role === ROLES.ADMIN && (
                                <Button variant="danger" icon="delete" onClick={handleDelete}>Delete</Button>
                            )}
                        </div>
                    </div>

                    <div className="flex-row gap-xl" style={{marginBottom: 'var(--spacing-xl)'}}>
                        <div style={{flex: 1}}>
                            <h3 style={{fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--color-text-primary)'}}>Personal Information</h3>
                            <div className="flex-col gap-sm" style={{color: 'var(--color-text-secondary)'}}>
                                <div className="flex-row justify-between"><span>Badge ID:</span><span className="text-bold">{officer?.badgeId}</span></div>
                                <div className="flex-row justify-between"><span>Email:</span><span>{officer?.email}</span></div>
                                <div className="flex-row justify-between"><span>Phone:</span><span>{officer?.phone}</span></div>
                                <div className="flex-row justify-between"><span>Status:</span><span>{officer?.status}</span></div>
                            </div>
                        </div>
                        <div style={{flex: 1}}>
                            <h3 style={{fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--color-text-primary)'}}>Assignment Details</h3>
                            <div className="flex-col gap-sm" style={{color: 'var(--color-text-secondary)'}}>
                                <div className="flex-row justify-between"><span>Department:</span><span className="text-bold">City Police Department</span></div>
                                <div className="flex-row justify-between"><span>Total Tickets Issued:</span><span>{officerTickets.length}</span></div>
                                <div className="flex-row justify-between"><span>Last Active:</span><span>{new Date().toLocaleDateString()}</span></div>
                            </div>
                        </div>
                    </div>

                    <div style={{marginTop: 'var(--spacing-xxl)'}}>
                        <h3 style={{fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--color-text-primary)'}}>Tickets Issued by {officer?.name}</h3>
                        <div className="data-list" style={{maxHeight: '400px', overflowY: 'auto'}}>
                            <div className="data-list-header">
                                <div className="data-list-col" style={{flex: '0 0 120px'}}>Ticket ID</div>
                                <div className="data-list-col" style={{flex: '0 0 120px'}}>License Plate</div>
                                <div className="data-list-col col-wide">Violation Type</div>
                                <div className="data-list-col" style={{flex: '0 0 100px'}}>Amount</div>
                                <div className="data-list-col" style={{flex: '0 0 120px'}}>Issue Date</div>
                                <div className="data-list-col" style={{flex: '0 0 100px'}}>Status</div>
                            </div>
                            {officerTickets.length === 0 ? (
                                <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                    <p>This officer has not issued any tickets yet.</p>
                                </div>
                            ) : (
                                officerTickets.map(ticket => (
                                    <TicketCard key={ticket.id} ticket={ticket} onClick={() => navigate('TICKET_DETAIL', { id: ticket.id })} />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </>
        );
    };

    const CreateEditTicketScreen = ({ isEdit }) => {
        const ticketId = view.params.id;
        const existingTicket = isEdit ? tickets.find(t => t.id === ticketId) : null;

        const [formData, setFormData] = useState({
            violationType: existingTicket?.violationType || '',
            fineAmount: existingTicket?.fineAmount || '',
            licensePlate: existingTicket?.licensePlate || '',
            vehicleMake: existingTicket?.vehicleMake || '',
            vehicleModel: existingTicket?.vehicleModel || '',
            vehicleColor: existingTicket?.vehicleColor || '',
            officerId: existingTicket?.officerId || mockOfficers[0]?.id || '',
            location: existingTicket?.location || '',
            issueDate: existingTicket?.issueDate || new Date().toISOString().split('T')[0],
            dueDate: existingTicket?.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            notes: existingTicket?.notes || '',
            photos: existingTicket?.photos || [],
            status: existingTicket?.status || TICKET_STATUSES.ISSUED
        });
        const [errors, setErrors] = useState({});

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
            if (errors[name]) { // Clear error on change
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[name];
                    return newErrors;
                });
            }
        };

        const handleFileChange = (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const newPhotoPath = URL.createObjectURL(file); // Simulate file upload
                setFormData(prev => ({ ...prev, photos: [...prev.photos, newPhotoPath] }));
            }
        };

        const validateForm = () => {
            const newErrors = {};
            if (!formData.violationType) newErrors.violationType = 'Violation type is required.';
            if (!formData.fineAmount || parseFloat(formData.fineAmount) <= 0) newErrors.fineAmount = 'Valid fine amount is required.';
            if (!formData.licensePlate) newErrors.licensePlate = 'License plate is required.';
            if (!formData.officerId) newErrors.officerId = 'Officer is required.';
            if (!formData.issueDate) newErrors.issueDate = 'Issue date is required.';
            if (!formData.location) newErrors.location = 'Location is required.';
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            if (!validateForm()) {
                alert('Please correct the form errors.');
                return;
            }

            const newTicketData = {
                ...formData,
                fineAmount: parseFloat(formData.fineAmount),
                officerName: officers.find(o => o.id === formData.officerId)?.name || 'Unknown Officer',
            };

            if (isEdit) {
                setTickets(prev => prev.map(t => t.id === ticketId ? { ...newTicketData, id: ticketId, auditLog: [...(t.auditLog || []), { timestamp: new Date().toLocaleString(), user: user.name, action: `Ticket updated.`, details: `Changes applied.` }] } : t));
                alert('Ticket updated successfully!');
            } else {
                const newId = `TKT-${1000 + tickets.length}`;
                const creationLog = [{ timestamp: new Date().toLocaleString(), user: user.name, action: `Ticket ${newId} created.`, details: `Initial fine: $${newTicketData.fineAmount.toFixed(2)}` }];
                const workflowStages = [
                    { stage: 'Issued', date: newTicketData.issueDate, status: 'completed' },
                    { stage: 'Reviewed', date: null, status: 'pending' },
                    { stage: 'Actioned', date: null, status: 'pending' },
                    { stage: 'Closed', date: null, status: 'pending' }
                ];
                setTickets(prev => [...prev, { ...newTicketData, id: newId, auditLog: creationLog, workflow: workflowStages }]);
                alert('New ticket created successfully!');
            }
            navigate('TICKET_DETAIL', { id: isEdit ? ticketId : `TKT-${1000 + tickets.length}` });
        };

        return (
            <>
                <div className="page-header">
                    <h1>{isEdit ? `Edit Ticket: ${ticketId}` : 'Create New Ticket'}</h1>
                    <Breadcrumbs items={[
                        { label: 'Dashboard', link: { screen: 'DASHBOARD' } },
                        { label: 'Tickets', link: { screen: 'TICKETS_LIST' } },
                        { label: isEdit ? `Edit ${ticketId}` : 'Create New' }
                    ]} />
                </div>

                <div className="glass-panel">
                    <form onSubmit={handleSubmit}>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)'}}>
                            <div>
                                <h3 style={{fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--color-text-primary)'}}>Violation Details</h3>
                                <div className="form-group">
                                    <label htmlFor="violationType">Violation Type <span style={{color: 'var(--color-danger)'}}>*</span></label>
                                    <select id="violationType" name="violationType" value={formData.violationType} onChange={handleChange} required>
                                        <option value="">Select a violation type</option>
                                        {mockViolations.map(v => <option key={v.id} value={v.type}>{v.type}</option>)}
                                    </select>
                                    {errors.violationType && <p className="error-message">{errors.violationType}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="fineAmount">Fine Amount <span style={{color: 'var(--color-danger)'}}>*</span></label>
                                    <input type="number" id="fineAmount" name="fineAmount" value={formData.fineAmount} onChange={handleChange} min="0.01" step="0.01" required />
                                    {errors.fineAmount && <p className="error-message">{errors.fineAmount}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="location">Location <span style={{color: 'var(--color-danger)'}}>*</span></label>
                                    <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Main St & 1st Ave" required />
                                    {errors.location && <p className="error-message">{errors.location}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="issueDate">Issue Date <span style={{color: 'var(--color-danger)'}}>*</span></label>
                                    <input type="date" id="issueDate" name="issueDate" value={formData.issueDate} onChange={handleChange} required />
                                    {errors.issueDate && <p className="error-message">{errors.issueDate}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="dueDate">Due Date</label>
                                    <input type="date" id="dueDate" name="dueDate" value={formData.dueDate} onChange={handleChange} />
                                </div>
                            </div>

                            <div>
                                <h3 style={{fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--color-text-primary)'}}>Vehicle & Officer</h3>
                                <div className="form-group">
                                    <label htmlFor="licensePlate">License Plate <span style={{color: 'var(--color-danger)'}}>*</span></label>
                                    <input type="text" id="licensePlate" name="licensePlate" value={formData.licensePlate} onChange={handleChange} placeholder="e.g., ABC-123" required />
                                    {errors.licensePlate && <p className="error-message">{errors.licensePlate}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="vehicleMake">Vehicle Make (Auto-populated from plate)</label>
                                    <input type="text" id="vehicleMake" name="vehicleMake" value={formData.vehicleMake} onChange={handleChange} placeholder="e.g., Toyota" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="vehicleModel">Vehicle Model</label>
                                    <input type="text" id="vehicleModel" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} placeholder="e.g., Camry" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="vehicleColor">Vehicle Color</label>
                                    <input type="text" id="vehicleColor" name="vehicleColor" value={formData.vehicleColor} onChange={handleChange} placeholder="e.g., Silver" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="officerId">Issued By Officer <span style={{color: 'var(--color-danger)'}}>*</span></label>
                                    <select id="officerId" name="officerId" value={formData.officerId} onChange={handleChange} required>
                                        <option value="">Select officer</option>
                                        {officers.map(o => <option key={o.id} value={o.id}>{o.name} ({o.badgeId})</option>)}
                                    </select>
                                    {errors.officerId && <p className="error-message">{errors.officerId}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="notes">Notes</label>
                            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} placeholder="Add any relevant notes here..."></textarea>
                        </div>

                        <div className="form-group">
                            <label>Photos/Evidence</label>
                            <div className="file-upload-wrapper">
                                <input type="file" id="fileUpload" onChange={handleFileChange} accept="image/*" multiple />
                                <label htmlFor="fileUpload">
                                    <span className="material-symbols-outlined icon">upload_file</span>
                                    Upload File
                                </label>
                                {formData.photos.length > 0 && (
                                    <div className="flex-col gap-sm">
                                        {formData.photos.map((photo, index) => (
                                            <span key={index} className="file-name">
                                                <span className="material-symbols-outlined" style={{marginRight: 'var(--spacing-xs)', verticalAlign: 'middle', fontSize: 'var(--font-size-sm)'}}>attachment</span>
                                                {photo.split('/').pop()} (Preview...)
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {formData.photos.length === 0 && <span className="file-name">No files selected.</span>}
                            </div>
                        </div>

                        {isEdit && user.role === ROLES.ADMIN && (
                            <div className="form-group">
                                <label htmlFor="status">Ticket Status</label>
                                <select id="status" name="status" value={formData.status} onChange={handleChange}>
                                    {Object.values(TICKET_STATUSES).map(status => (
                                        <option key={status} value={status}>{STATUS_UI_MAP[status].label}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex-row justify-between mt-xl">
                            <Button variant="secondary" onClick={() => navigate('TICKET_DETAIL', { id: ticketId })}>Cancel</Button>
                            <Button type="submit" variant="primary" icon="save">{isEdit ? 'Save Changes' : 'Create Ticket'}</Button>
                        </div>
                    </form>
                </div>
            </>
        );
    };

    const NotFoundScreen = () => (
        <div className="main-content" style={{textAlign: 'center', padding: 'var(--spacing-xxl)'}}>
            <h1 style={{fontSize: 'var(--font-size-4xl)', color: 'var(--color-danger)'}}>404 - Page Not Found</h1>
            <p style={{marginTop: 'var(--spacing-md)', fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)'}}>The screen you are trying to access does not exist.</p>
            <Button variant="primary" icon="dashboard" onClick={() => navigate('DASHBOARD')} style={{marginTop: 'var(--spacing-lg)'}}>Go to Dashboard</Button>
        </div>
    );

    // Main App Render
    return (
        <div className="app-container">
            <Sidebar />
            <Header />
            <main className="main-content">
                {user?.role !== ROLES.ADMIN && (
                    <div className="glass-panel" style={{backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: 'var(--color-danger)', color: 'var(--color-danger)', marginBottom: 'var(--spacing-lg)'}}>
                        <p style={{fontWeight: 'var(--font-weight-bold)'}}>Access Denied: You must be an Admin to view this application.</p>
                        <p style={{fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-sm)'}}>Please contact support if you believe this is an error.</p>
                    </div>
                )}

                {user?.role === ROLES.ADMIN ? (
                    (() => {
                        switch (view.screen) {
                            case 'DASHBOARD':
                                return <DashboardScreen />;
                            case 'TICKETS_LIST':
                                return <TicketsListScreen />;
                            case 'TICKET_DETAIL':
                                return <TicketDetailScreen />;
                            case 'EDIT_TICKET':
                                return <CreateEditTicketScreen isEdit={true} />;
                            case 'CREATE_TICKET':
                                return <CreateEditTicketScreen isEdit={false} />;
                            case 'PAYMENTS_LIST':
                                return <PaymentsListScreen />;
                            case 'PAYMENT_DETAIL':
                                return <PaymentDetailScreen />;
                            case 'OFFICERS_LIST':
                                return <OfficersListScreen />;
                            case 'OFFICER_DETAIL':
                                return <OfficerDetailScreen />;
                            case 'EDIT_OFFICER':
                                // Placeholder for edit officer form
                                return (
                                    <div className="glass-panel" style={{textAlign: 'center', padding: 'var(--spacing-xxl)'}}>
                                        <h1 style={{color: 'var(--color-primary)'}}>Edit Officer {view.params.id}</h1>
                                        <p style={{marginTop: 'var(--spacing-md)', color: 'var(--color-text-secondary)'}}>This is a placeholder for the edit officer form.</p>
                                        <Button variant="primary" icon="arrow_back" onClick={() => navigate('OFFICER_DETAIL', { id: view.params.id })} style={{marginTop: 'var(--spacing-lg)'}}>Back to Officer Details</Button>
                                    </div>
                                );
                            case 'CREATE_OFFICER':
                                // Placeholder for create officer form
                                return (
                                    <div className="glass-panel" style={{textAlign: 'center', padding: 'var(--spacing-xxl)'}}>
                                        <h1 style={{color: 'var(--color-primary)'}}>Create New Officer</h1>
                                        <p style={{marginTop: 'var(--spacing-md)', color: 'var(--color-text-secondary)'}}>This is a placeholder for the create officer form.</p>
                                        <Button variant="primary" icon="arrow_back" onClick={() => navigate('OFFICERS_LIST')} style={{marginTop: 'var(--spacing-lg)'}}>Back to Officers List</Button>
                                    </div>
                                );
                            case 'SETTINGS':
                                // Placeholder for admin settings
                                return (
                                    <div className="glass-panel" style={{textAlign: 'center', padding: 'var(--spacing-xxl)'}}>
                                        <h1 style={{color: 'var(--color-primary)'}}>Admin Settings</h1>
                                        <p style={{marginTop: 'var(--spacing-md)', color: 'var(--color-text-secondary)'}}>Manage application settings, users, roles, etc.</p>
                                        <Button variant="primary" icon="dashboard" onClick={() => navigate('DASHBOARD')} style={{marginTop: 'var(--spacing-lg)'}}>Back to Dashboard</Button>
                                    </div>
                                );
                            default:
                                return <NotFoundScreen />;
                        }
                    })()
                ) : (
                    // Content for non-admin users or login page
                    <div className="glass-panel" style={{textAlign: 'center', padding: 'var(--spacing-xxl)'}}>
                        <h1 style={{color: 'var(--color-primary)'}}>Login Required</h1>
                        <p style={{marginTop: 'var(--spacing-md)', color: 'var(--color-text-secondary)'}}>Please log in with an Admin account to access the system.</p>
                        <Button variant="primary" icon="login" onClick={() => setUser({ id: 'admin1', name: 'System Admin', role: ROLES.ADMIN, avatar: 'SA' })} style={{marginTop: 'var(--spacing-lg)'}}>Login as Admin</Button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
