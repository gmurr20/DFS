from datetime import datetime, date
import logging

SEASON = 2025

def get_upcoming_nfl_week():
    # NFL 2025 season specific dates
    nfl_2025_weeks = {
        1: [date(2025, 8, 1), date(2025, 9, 2)],
        2: [date(2025, 9, 3), date(2025, 9, 9)],
        3: [date(2025, 9, 10), date(2025, 9, 16)],
        4: [date(2025, 9, 17), date(2025, 9, 23)],
        5: [date(2025, 9, 24), date(2025, 9, 30)],
        6: [date(2025, 10, 1), date(2025, 10, 7)],
        7: [date(2025, 10, 8), date(2025, 10, 14)],
        8: [date(2025, 10, 15), date(2025, 10, 21)],
        9: [date(2025, 10, 22), date(2025, 10, 28)],
        10: [date(2025, 10, 29), date(2025, 11, 4)],
        11: [date(2025, 11, 5), date(2025, 11, 11)],
        12: [date(2025, 11, 12), date(2025, 11, 18)],
        13: [date(2025, 11, 19), date(2025, 11, 25)],
        14: [date(2025, 11, 26), date(2025, 12, 2)],
        15: [date(2025, 12, 3), date(2025, 12, 9)],
        16: [date(2025, 12, 10), date(2025, 12, 16)],
        17: [date(2025, 12, 17), date(2025, 12, 23)],
        18: [date(2025, 12, 24), date(2025, 12, 30)],
        # Playoffs
        19: [date(2025, 12, 31), date(2026, 1, 6)],
        20: [date(2026, 1, 7), date(2026, 1, 13)],
        21: [date(2026, 1, 14), date(2026, 1, 20)],
        22: [date(2026, 1, 21), date(2026, 2, 9)],
    }

    curr_date = datetime.now().date()

    # Find the current week
    for week, date_range in nfl_2025_weeks.items():
        if date_range[0] <= curr_date and date_range[1] > curr_date:
            return week
    logging.error('We are outside date range of NFL')
    return None


def game_dates(week: int) -> str:
    week_to_sunday = {
        1: ['20250907'],
        2: ['20250914'],
        3: ['20250921'],
        4: ['20250928'],
        5: ['20251005'],
        6: ['20251012'],
        7: ['20251019'],
        8: ['20251026'],
        9: ['20251102'],
        10: ['20251109'],
        11: ['20251116'],
        12: ['20251123'],
        13: ['20251130'],
        14: ['20251207'],
        15: ['20251214'],
        16: ['20251221'],
        17: ['20251228'],
        18: ['20260104'],
        19: ['20260111'],  # Wild Card Round
        20: ['20260118'],  # Divisional Round
        21: ['20260125'],  # Conference Championships
        22: ['20260208'],  # Super Bowl Sunday
    }
    return week_to_sunday[week]