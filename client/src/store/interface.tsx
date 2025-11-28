export interface Service {
    id?: number;
    start_address?: string;
    end_address?: string;
    start_time?: string;
    end_time?: string;
    license_id?: number;
    drive_id?: number;
    start_km?: number | null;
    end_km?: number | null;
    note?: string | null;
    created_at?: string;
    service_number?: string | null;
    effective_start_time?: string | null;
    effective_end_time?: string | null;
    garage_id?: number;
    default_garage_id?: number | null;
    effective_start_address?: string | null;
    effective_start_latitude?: string | null;
    effective_start_longitude?: string | null;
    effective_end_address?: string | null;
    effective_end_latitude?: string | null;
    effective_end_longitude?: string | null;
    draft?: boolean;
    draft_error?: string | null;
    created_by_garage?: boolean;
    is_deleted?: boolean;
    service_id?: string;
    customers?: string[];
    status?: number;
    garage?: Garage;
    driver_name?: string,
    driver_id?: string | number
}

export interface ServiceUpdate {
    km?: number;
    latitude: string;
    longitude: string;
    address?: string;
    timestamp?: string;
}

export interface Garage {
    id: number;
    name: string;
    address: string;
    zip: string;
    province: string;
    latitude: string;
    longitude: string;
    city: string;
    parking_lots: number;
    phone: string;
    images: string[];
    is_parking: boolean;
    hourly_cost: string;
    is_active_garage: boolean;
    is_passive_garage: boolean;
    is_available: boolean;
    settings: {
        approach_distance: string;
        enter_distance: string;
        exit_distance: string;
    };
    disabled: boolean;
    has_services: boolean;
    opening_hour: {
        [key in 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun']: {
            lots: string;
            hours: Array<{
                start: string;
                end: string;
            }>;
        };
    };
    user: {
        id: number;
        email: string;
        email_verified_at: string | null;
        created_at: string;
        updated_at: string;
        role: number;
        current_token: string | null;
        token_expiration: string | null;
        user_group_id: number | null;
        subscription_bonus_days_id: number | null;
        email_verified: boolean;
        active_plans: any[];
        disabled: boolean;
        subscription: any | null;
    };
}

export interface GarageSettings {
    approachDistance: string;
    enterDistance: string;
    exitDistance: string;
}

export interface OpeningHour {
    [day: string]: {
        lots: string;
        hours: Array<{ start: string; end: string; }>;
    };
}

export interface GarageUser {
    id: number;
    email: string;
    emailVerifiedAt: string | null;
    createdAt: string;
    updatedAt: string;
    role: number;
    currentToken: string | null;
    tokenExpiration: string | null;
    userGroupId: number | null;
    subscriptionBonusDaysId: number | null;
    emailVerified: boolean;
    activePlans: any[];
    disabled: boolean;
    subscription: any;
}

export interface Driver {
    id?: number;
    user_id?: number;
    first_name: string;
    last_name: string;
    fiscal_code: string;
    birth_date: string;
    primary: boolean;
    deleted?: boolean
}
